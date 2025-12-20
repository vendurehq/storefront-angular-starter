import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map, switchMap, withLatestFrom } from 'rxjs/operators';

import {
    AddToCartMutation,
    AddToCartMutationVariables,
    GetProductDetailQuery,
    GetProductDetailQueryVariables
} from '../../../common/generated-types';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';
import { DataService } from '../../providers/data/data.service';
import { NotificationService } from '../../providers/notification/notification.service';
import { StateService } from '../../providers/state/state.service';

import { ADD_TO_CART, GET_PRODUCT_DETAIL } from './product-detail.graphql';
import { ActiveService } from '../../providers/active/active.service';

type Variant = NonNullable<GetProductDetailQuery['product']>['variants'][number];
type Collection = NonNullable<GetProductDetailQuery['product']>['collections'][number];

@Component({
    standalone: false,
    selector: 'vsf-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
    private dataService = inject(DataService);
    private stateService = inject(StateService);
    private notificationService = inject(NotificationService);
    private activeService = inject(ActiveService);
    private route = inject(ActivatedRoute);


    product: GetProductDetailQuery['product'];
    selectedAsset: { id: string; preview: string; };
    qtyInCart: { [id: string]: number; } = {};
    selectedVariant: Variant;
    qty = 1;
    breadcrumbs: Collection['breadcrumbs'] | null = null;
    inFlight = false;
    @ViewChild('addedToCartTemplate', {static: true})
    private addToCartTemplate: TemplateRef<any>;
    private sub: Subscription;

    ngOnInit() {
        const lastCollectionSlug$ = this.stateService.select(state => state.lastCollectionSlug);
        const productSlug$ = this.route.paramMap.pipe(
            map(paramMap => paramMap.get('slug')),
            filter(notNullOrUndefined),
        );

        this.sub = productSlug$.pipe(
            switchMap(slug => {
                return this.dataService.query<GetProductDetailQuery, GetProductDetailQueryVariables>(GET_PRODUCT_DETAIL, {
                        slug,
                    },
                );
            }),
            map(data => data.product),
            filter(notNullOrUndefined),
            withLatestFrom(lastCollectionSlug$),
        ).subscribe(([product, lastCollectionSlug]) => {
            this.product = product;
            if (this.product.featuredAsset) {
                this.selectedAsset = this.product.featuredAsset;
            }
            this.selectedVariant = product.variants[0];
            const collection = this.getMostRelevantCollection(product.collections, lastCollectionSlug);
            this.breadcrumbs = collection ? collection.breadcrumbs : [];
        });

        this.activeService.activeOrder$.subscribe(order => {
            this.qtyInCart = {};
            for (const line of order?.lines ?? []) {
                this.qtyInCart[line.productVariant.id] = line.quantity;
            }
        })
    }

    ngOnDestroy() {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }

    addToCart(variant: Variant, qty: number) {
        this.inFlight = true;
        this.dataService.mutate<AddToCartMutation, AddToCartMutationVariables>(ADD_TO_CART, {
            variantId: variant.id,
            qty,
        }).subscribe(({addItemToOrder}) => {
            this.inFlight = false;
            switch (addItemToOrder.__typename) {
                case 'Order':
                    this.stateService.setState('activeOrderId', addItemToOrder ? addItemToOrder.id : null);
                    if (variant) {
                        this.notificationService.notify({
                            title: 'Added to cart',
                            type: 'info',
                            duration: 3000,
                            templateRef: this.addToCartTemplate,
                            templateContext: {
                                variant,
                                quantity: qty,
                            },
                        }).subscribe();
                    }
                    break;
                case 'OrderModificationError':
                case 'OrderLimitError':
                case 'NegativeQuantityError':
                case 'InsufficientStockError':
                    this.notificationService.error(addItemToOrder.message).subscribe();
                    break;
            }

        });
    }

    viewCartFromNotification(closeFn: () => void) {
        this.stateService.setState('cartDrawerOpen', true);
        closeFn();
    }

    /**
     * If there is a collection matching the `lastCollectionId`, return that. Otherwise return the collection
     * with the longest `breadcrumbs` array, which corresponds to the most specific collection.
     */
    private getMostRelevantCollection(collections: Collection[], lastCollectionSlug: string | null) {
        const lastCollection = collections.find(c => c.slug === lastCollectionSlug);
        if (lastCollection) {
            return lastCollection;
        }
        return collections.slice().sort((a, b) => {
            if (a.breadcrumbs.length < b.breadcrumbs.length) {
                return 1;
            }
            if (a.breadcrumbs.length > b.breadcrumbs.length) {
                return -1;
            }
            return 0;
        })[0];
    }

}
