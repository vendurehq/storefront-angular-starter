import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, inject } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { map, shareReplay, switchMap, take } from 'rxjs/operators';

import {
    AdjustItemQuantityMutation, AdjustItemQuantityMutationVariables,
    GetActiveOrderQuery,
    GetActiveOrderQueryVariables,
    RemoveItemFromCartMutation, RemoveItemFromCartMutationVariables
} from '../../../common/generated-types';
import { DataService } from '../../providers/data/data.service';
import { NotificationService } from '../../providers/notification/notification.service';
import { StateService } from '../../providers/state/state.service';

import { ADJUST_ITEM_QUANTITY, REMOVE_ITEM_FROM_CART } from './cart-drawer.graphql';
import { ActiveService } from '../../providers/active/active.service';

@Component({
    standalone: false,
    selector: 'vsf-cart-drawer',
    templateUrl: './cart-drawer.component.html',
    styleUrls: ['./cart-drawer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDrawerComponent implements OnInit {
    private dataService = inject(DataService);
    private stateService = inject(StateService);
    private activeService = inject(ActiveService);
    private notificationService = inject(NotificationService);

    @Input() visible = false;
    @Output() close = new EventEmitter<void>();
    @ViewChild('overlay') private overlayRef: ElementRef<HTMLDivElement>;

    cart$: Observable<GetActiveOrderQuery['activeOrder']>;
    isEmpty$: Observable<boolean>;

    ngOnInit() {
        this.cart$ = merge(
            this.stateService.select(state => state.activeOrderId),
            this.stateService.select(state => state.signedIn),
        ).pipe(
            switchMap(() => this.activeService.activeOrder$),
            shareReplay(1),
        );
        this.isEmpty$ = this.cart$.pipe(
            map(cart => !cart || cart.lines.length === 0),
        );
    }

    setQuantity(event: { itemId: string; quantity: number; }) {
        if (0 < event.quantity) {
            this.adjustItemQuantity(event.itemId, event.quantity);
        } else {
            this.removeItem(event.itemId);
        }
    }

    overlayClick(event: MouseEvent) {
        if (event.target === this.overlayRef.nativeElement) {
            this.close.emit();
        }
    }

    private adjustItemQuantity(id: string, qty: number) {
        this.dataService.mutate<AdjustItemQuantityMutation, AdjustItemQuantityMutationVariables>(ADJUST_ITEM_QUANTITY, {
            id,
            qty,
        }).pipe(
            take(1),
        ).subscribe(({ adjustOrderLine }) => {
            switch (adjustOrderLine.__typename) {
                case 'Order':
                    break;
                case 'InsufficientStockError':
                case 'NegativeQuantityError':
                case 'OrderLimitError':
                case 'OrderModificationError':
                    this.notificationService.error(adjustOrderLine.message).subscribe();
                    break;
            }
        });
    }

    private removeItem(id: string) {
        this.dataService.mutate<RemoveItemFromCartMutation, RemoveItemFromCartMutationVariables>(REMOVE_ITEM_FROM_CART, {
            id,
        }).pipe(
            take(1),
        ).subscribe();
    }
}
