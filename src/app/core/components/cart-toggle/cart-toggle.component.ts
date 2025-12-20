import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { from, interval, merge, Observable, timer, zip } from 'rxjs';
import { delay, distinctUntilChanged, map, refCount, share, shareReplay, switchMap } from 'rxjs/operators';

import { GetCartTotalsQuery } from '../../../common/generated-types';
import { DataService } from '../../providers/data/data.service';
import { StateService } from '../../providers/state/state.service';

import { GET_CART_TOTALS } from './cart-toggle.graphql';

@Component({
    standalone: false,
    selector: 'vsf-cart-toggle',
    templateUrl: './cart-toggle.component.html',
    styleUrls: ['./cart-toggle.component.scss'],
})
export class CartToggleComponent implements OnInit {
    private dataService = inject(DataService);
    private stateService = inject(StateService);

    @Output() toggle = new EventEmitter<void>();
    cart$: Observable<{ total: number; quantity: number; }>;
    cartChangeIndication$: Observable<boolean>;

    ngOnInit() {
        this.cart$ = merge(
            this.stateService.select(state => state.activeOrderId),
            this.stateService.select(state => state.signedIn),
        ).pipe(
            switchMap(() => this.dataService.query<GetCartTotalsQuery>(GET_CART_TOTALS, {}, 'network-only')),
            map(({activeOrder}) => {
                return {
                    total: activeOrder ? activeOrder.totalWithTax : 0,
                    quantity: activeOrder ? activeOrder.totalQuantity : 0,
                };
            }),
            shareReplay(1),
        );
        this.cartChangeIndication$ = this.cart$.pipe(
            map(cart => cart.quantity),
            distinctUntilChanged(),
            switchMap(() => zip(
                    from([true, false]),
                    timer(0, 1000),
                ),
            ),
            map(([boolean, _]) => boolean),
        );
    }
}
