import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { map, mergeMap, switchMap, takeUntil, tap } from 'rxjs/operators';

import {
    AddressFragment,
    CreateAddressInput,
    GetAvailableCountriesQuery,
    GetCustomerAddressesQuery,
    GetEligibleShippingMethodsQuery,
    GetOrderShippingDataQuery,
    SetCustomerForOrderMutation,
    SetCustomerForOrderMutationVariables,
    SetShippingAddressMutation,
    SetShippingAddressMutationVariables,
    SetShippingMethodMutation,
    SetShippingMethodMutationVariables,
    TransitionToArrangingPaymentMutation
} from '../../../common/generated-types';
import { GET_AVAILABLE_COUNTRIES, GET_CUSTOMER_ADDRESSES } from '../../../common/graphql/documents.graphql';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';
import { DataService } from '../../../core/providers/data/data.service';
import { ModalService } from '../../../core/providers/modal/modal.service';
import { NotificationService } from '../../../core/providers/notification/notification.service';
import { StateService } from '../../../core/providers/state/state.service';
import { AddressFormComponent } from '../../../shared/components/address-form/address-form.component';
import { AddressModalComponent } from '../../../shared/components/address-modal/address-modal.component';

import {
    GET_ELIGIBLE_SHIPPING_METHODS,
    GET_ORDER_SHIPPING_DATA,
    SET_CUSTOMER_FOR_ORDER,
    SET_SHIPPING_ADDRESS,
    SET_SHIPPING_METHOD,
    TRANSITION_TO_ARRANGING_PAYMENT,
} from './checkout-shipping.graphql';

export type AddressFormValue = Pick<AddressFragment, Exclude<keyof AddressFragment, 'country'>> & { countryCode: string; };

@Component({
    standalone: false,
    selector: 'vsf-checkout-shipping',
    templateUrl: './checkout-shipping.component.html',
    // styleUrls: ['./checkout-shipping.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutShippingComponent implements OnInit, OnDestroy {
    private dataService = inject(DataService);
    private stateService = inject(StateService);
    private changeDetector = inject(ChangeDetectorRef);
    private modalService = inject(ModalService);
    private notificationService = inject(NotificationService);
    private formBuilder = inject(UntypedFormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    @ViewChild('addressForm') addressForm: AddressFormComponent;

    customerAddresses$: Observable<AddressFragment[]>;
    availableCountries$: Observable<GetAvailableCountriesQuery['availableCountries']>;
    eligibleShippingMethods$: Observable<GetEligibleShippingMethodsQuery['eligibleShippingMethods']>;
    shippingAddress$: Observable<NonNullable<GetOrderShippingDataQuery['activeOrder']>['shippingAddress']>;
    signedIn$: Observable<boolean>;
    shippingMethodId: string | undefined;
    contactForm: UntypedFormGroup;
    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.contactForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            emailAddress: ['', Validators.email],
        });
        this.signedIn$ = this.stateService.select(state => state.signedIn);
        this.customerAddresses$ = this.dataService.query<GetCustomerAddressesQuery>(GET_CUSTOMER_ADDRESSES).pipe(
            map(data => data.activeCustomer ? data.activeCustomer.addresses || [] : []),
        );
        this.availableCountries$ = this.dataService.query<GetAvailableCountriesQuery>(GET_AVAILABLE_COUNTRIES).pipe(
            map(data => data.availableCountries),
        );
        const shippingData$ = this.dataService.query<GetOrderShippingDataQuery>(GET_ORDER_SHIPPING_DATA);
        this.shippingAddress$ = shippingData$.pipe(
            map(data => data.activeOrder && data.activeOrder.shippingAddress),
        );
        this.eligibleShippingMethods$ = this.shippingAddress$.pipe(
            switchMap(() => this.dataService.query<GetEligibleShippingMethodsQuery>(GET_ELIGIBLE_SHIPPING_METHODS)),
            map(data => data.eligibleShippingMethods),
        );

        shippingData$.pipe(
            map(data => data.activeOrder && data.activeOrder.customer),
            takeUntil(this.destroy$)
        ).subscribe(customer => {
            if (customer) {
                this.contactForm.patchValue({
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    emailAddress: customer.emailAddress,
                }, {emitEvent: false});
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getLines(address: AddressFragment): string[] {
        return [
            address.fullName,
            address.company,
            address.streetLine1,
            address.streetLine2,
            address.province,
            address.postalCode,
            address.country.name,
        ].filter(notNullOrUndefined);
    }

    createAddress() {
        this.modalService.fromComponent(AddressModalComponent, {
            locals: {
                title: 'Create new address',
            },
            closable: true,
        }).pipe(
            switchMap(() => this.dataService.query<GetCustomerAddressesQuery>(GET_CUSTOMER_ADDRESSES, {}, 'network-only')),
        )
            .subscribe();
    }

    editAddress(address: AddressFragment) {
        this.addressForm.addressForm.patchValue({...address, countryCode: address.country.code});
    }

    onCustomerFormBlur() {
        this.setCustomerForOrder()?.subscribe();
    }

    onAddressFormBlur(addressForm: UntypedFormGroup) {
        if (addressForm.dirty && addressForm.valid) {
            this.setShippingAddress(addressForm.value);
        }
    }

    setShippingAddress(value: AddressFormValue | AddressFragment) {
        const input = this.valueToAddressInput(value);
        this.dataService.mutate<SetShippingAddressMutation, SetShippingAddressMutationVariables>(SET_SHIPPING_ADDRESS, {
            input,
        }).subscribe(data => {
            this.changeDetector.markForCheck();
        });
    }

    setShippingMethod(id: string) {
        this.shippingMethodId = id;
    }

    proceedToPayment() {
        const shippingMethodId = this.shippingMethodId;
        if (shippingMethodId) {
            this.stateService.select(state => state.signedIn).pipe(
                mergeMap(signedIn => !signedIn ? this.setCustomerForOrder() || of({}) : of({})),
                mergeMap(() =>
                    this.dataService.mutate<SetShippingMethodMutation, SetShippingMethodMutationVariables>(SET_SHIPPING_METHOD, {
                        id: shippingMethodId,
                    }),
                ),
                mergeMap(() => this.dataService.mutate<TransitionToArrangingPaymentMutation>(TRANSITION_TO_ARRANGING_PAYMENT)),
            ).subscribe((data) => {
                this.router.navigate(['../payment'], {relativeTo: this.route});
            });
        }
    }

    getId(method: { id: string }) {
        return method.id;
    }

    private setCustomerForOrder() {
        if (this.contactForm.valid) {
            return this.dataService.mutate<SetCustomerForOrderMutation, SetCustomerForOrderMutationVariables>(SET_CUSTOMER_FOR_ORDER, {
                input: this.contactForm.value,
            }).pipe(
                tap(({setCustomerForOrder}) => {
                    if (setCustomerForOrder && setCustomerForOrder.__typename !== 'Order') {
                        this.notificationService.error((setCustomerForOrder as any).message).subscribe();
                    }
                })
            );
        }
        return null;
    }

    private valueToAddressInput(value: AddressFormValue | AddressFragment): CreateAddressInput {
        return {
            city: value.city || '',
            company: value.company || '',
            countryCode: this.isFormValue(value) ? value.countryCode : value.country.code,
            defaultBillingAddress: value.defaultBillingAddress,
            defaultShippingAddress: value.defaultShippingAddress,
            fullName: value.fullName || '',
            phoneNumber: value.phoneNumber || '',
            postalCode: value.postalCode || '',
            province: value.province || '',
            streetLine1: value.streetLine1 || '',
            streetLine2: value.streetLine2 || '',
        };
    }

    private isFormValue(input: AddressFormValue | AddressFragment): input is AddressFormValue {
        return typeof (input as any).countryCode === 'string';
    }
}
