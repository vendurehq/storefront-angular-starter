import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { AddressFragment, CountryFragment, OrderAddressFragment } from '../../../common/generated-types';

@Component({
    standalone: false,
    selector: 'vsf-address-form',
    templateUrl: './address-form.component.html',
    // styleUrls: ['./address-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent implements OnChanges {
    private formBuilder = inject(UntypedFormBuilder);


    @Input() availableCountries: CountryFragment[];
    @Input() address: OrderAddressFragment | AddressFragment;

    addressForm: UntypedFormGroup;
    constructor() {
        this.addressForm = this.formBuilder.group({
            fullName: '',
            company: '',
            streetLine1: ['', Validators.required],
            streetLine2: '',
            city: ['', Validators.required],
            province: '',
            postalCode: ['', Validators.required],
            countryCode: ['', Validators.required],
            phoneNumber: '',
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if ('address' in changes && this.addressForm && this.address) {
            this.addressForm.patchValue(this.address, { });
        }
        const country = this.address && this.address.country;
        if (country && this.availableCountries) {
            if (country && typeof country !== 'string') {
                this.addressForm.patchValue({
                    countryCode: country.code,
                });
            } else {
                const matchingCountry = this.availableCountries.find(c => c.name === country);
                if (matchingCountry) {
                    this.addressForm.patchValue({
                        countryCode: matchingCountry.code,
                    });
                }
            }
        }
    }

}
