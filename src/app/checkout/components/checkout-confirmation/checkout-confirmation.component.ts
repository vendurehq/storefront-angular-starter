import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, map, mergeMap, shareReplay, switchMap, take } from 'rxjs/operators';

import { REGISTER } from '../../../account/components/register/register.graphql';
import {
    GetOrderByCodeQuery,
    GetOrderByCodeQueryVariables,
    RegisterMutation,
    RegisterMutationVariables
} from '../../../common/generated-types';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';

import { GET_ORDER_BY_CODE } from './checkout-confirmation.graphql';

@Component({
    standalone: false,
    selector: 'vsf-checkout-confirmation',
    templateUrl: './checkout-confirmation.component.html',
    // styleUrls: ['./checkout-confirmation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutConfirmationComponent implements OnInit {
    private stateService = inject(StateService);
    private dataService = inject(DataService);
    private changeDetector = inject(ChangeDetectorRef);
    private route = inject(ActivatedRoute);

    registrationSent = false;
    order$: Observable<GetOrderByCodeQuery['orderByCode']>;
    notFound$: Observable<boolean>;

    ngOnInit() {
        const orderRequest$ = this.route.paramMap.pipe(
            map(paramMap => paramMap.get('code')),
            filter(notNullOrUndefined),
            switchMap(code => this.dataService.query<GetOrderByCodeQuery, GetOrderByCodeQueryVariables>(
                GET_ORDER_BY_CODE,
                { code },
            )),
            map(data => data.orderByCode),
            shareReplay(1),
        );
        this.order$ = orderRequest$.pipe(
            filter(notNullOrUndefined),
        );
        this.notFound$ = orderRequest$.pipe(
            map(res => !res),
        );
    }

    register() {
        this.order$.pipe(
            take(1),
            mergeMap(order => {
                const customer = order?.customer;
                if (customer) {
                    return this.dataService.mutate<RegisterMutation, RegisterMutationVariables>(REGISTER, {
                        input: {
                            emailAddress: customer.emailAddress,
                            firstName: customer.firstName,
                            lastName: customer.lastName,
                        },
                    });
                } else {
                    return of({});
                }
            }),
        ).subscribe(() => {
            this.registrationSent = true;
            this.changeDetector.markForCheck();
        });
    }
}
