import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';

import { GetOrderForCheckoutQuery } from '../../common/generated-types';
import { DataService } from '../../core/providers/data/data.service';

import { GET_ORDER_FOR_CHECKOUT } from './checkout-resolver.graphql';

export type ActiveOrderStream = Observable<GetOrderForCheckoutQuery['activeOrder'] | null | undefined>;

@Injectable({ providedIn: 'root' })
export class CheckoutResolver  {
    private dataService = inject(DataService);


    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ActiveOrderStream> {
        const activeOrder$ = this.dataService.query<GetOrderForCheckoutQuery>(GET_ORDER_FOR_CHECKOUT).pipe(
            map(data => data.activeOrder),
        );

        const stream = activeOrder$.pipe(
            shareReplay(1),
        );

        return stream.pipe(
            take(1),
            map(() => stream),
        );
    }
}
