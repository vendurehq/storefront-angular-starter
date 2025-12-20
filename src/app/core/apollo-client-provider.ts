import { isPlatformBrowser } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { FactoryProvider, Optional, PLATFORM_ID, makeStateKey, TransferState } from '@angular/core';
import { map } from 'rxjs/operators';

import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core';
import { REQUEST } from '../../express.tokens';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { Request } from 'express';

import { environment } from '../../environments/environment';
import possibleTypesResult from '../common/introspection-results';

const STATE_KEY = makeStateKey<any>('apollo.state');
let apolloCache: InMemoryCache;

export const APOLLO_CLIENT_PROVIDER: FactoryProvider = {
    provide: APOLLO_OPTIONS,
    useFactory: apolloOptionsFactory,
    deps: [HttpLink, PLATFORM_ID, TransferState, [new Optional(), REQUEST]],
};

function mergeFields(existing: any, incoming: any) {
    return {...existing, ...incoming};
}

function relaceFields(existing: any, incoming: any) {
    return incoming;
}

// Trying to debug why sessions won't work in Safari 13.1
// but only on the live prod version.
function logInterceptorData(on: boolean) {
    localStorage.setItem('_logInterceptorData', on ? 'true' : 'false');
}

if (typeof window !== 'undefined') {
    (window as any).logInterceptorData = logInterceptorData;
}

export function apolloOptionsFactory(
    httpLink: HttpLink,
    platformId: object,
    transferState: TransferState,
    req?: Request,
): ApolloClient.Options {
    const AUTH_TOKEN_KEY = 'auth_token';
    apolloCache = new InMemoryCache({
        possibleTypes: possibleTypesResult.possibleTypes,
        typePolicies: {
            Query: {
                fields: {
                    eligibleShippingMethods: {
                        merge: relaceFields,
                    },
                },
            },
            Product: {
                fields: {
                    customFields: {
                        merge: mergeFields,
                    },
                },
            },
            Collection: {
                fields: {
                    customFields: {
                        merge: mergeFields,
                    },
                },
            },
            Order: {
                fields: {
                    lines: {
                        merge: relaceFields,
                    },
                    shippingLines: {
                        merge: relaceFields,
                    },
                    discounts: {
                        merge: relaceFields,
                    },
                    shippingAddress: {
                        merge: relaceFields,
                    },
                    billingAddress: {
                        merge: relaceFields,
                    },
                },
            },
            Customer: {
                fields: {
                    addresses: {
                        merge: relaceFields,
                    },
                    customFields: {
                        merge: mergeFields,
                    },
                },
            },
        },
    });

    const {apiHost, apiPort, shopApiPath} = environment;
    const uri = `${apiHost}:${apiPort}/${shopApiPath}`;
    const options = {
        uri,
        withCredentials: false,
    };

    const afterware = new ApolloLink((operation, forward) => {
        return forward(operation).pipe(map((response: ApolloLink.Result) => {
            const context = operation.getContext();
            const authHeader = context['response'].headers.get('vendure-auth-token');
            if (authHeader && isPlatformBrowser(platformId)) {
                // If the auth token has been returned by the Vendure
                // server, we store it in localStorage
                localStorage.setItem(AUTH_TOKEN_KEY, authHeader);
            }
            return response;
        }));
    });
    const middleware = new ApolloLink((operation, forward) => {
        if (isPlatformBrowser(platformId)) {
            operation.setContext({
                headers: new HttpHeaders().set(
                    'Authorization',
                    `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY) || null}`,
                ),
            });
        }
        return forward(operation);
    });

    const isBrowser = transferState.hasKey<any>(STATE_KEY);

    if (isBrowser) {
        const state = transferState.get<any>(STATE_KEY, null);
        apolloCache.restore(state);
    } else {
        transferState.onSerialize(STATE_KEY, () => {
            return apolloCache.extract();
        });
        // Reset apolloCache after extraction to avoid sharing between requests
        apolloCache.reset();
    }

    const http = httpLink.create(options);

    return {
        cache: apolloCache,
        ssrMode: true,
        ssrForceFetchDelay: 500,
        link: ApolloLink.from([middleware, afterware, http]),
    };
}
