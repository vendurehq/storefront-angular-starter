import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { filter, map } from 'rxjs/operators';

import {
    GetActiveCustomerQuery,
    UpdateCustomerDetailsMutation,
    UpdateCustomerDetailsMutationVariables,
    UpdateCustomerInput
} from '../../../common/generated-types';
import { GET_ACTIVE_CUSTOMER } from '../../../common/graphql/documents.graphql';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';
import { DataService } from '../../../core/providers/data/data.service';

import { UPDATE_CUSTOMER_DETAILS } from './account-customer-details.graphql';

@Component({
    standalone: false,
    selector: 'vsf-account-customer-details',
    templateUrl: './account-customer-details.component.html',
    // styleUrls: ['./account-customer-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountCustomerDetailsComponent implements OnInit {
    private dataService = inject(DataService);
    private formBuilder = inject(UntypedFormBuilder);
    private changeDetectorRef = inject(ChangeDetectorRef);


    form: UntypedFormGroup;

    ngOnInit() {
        this.dataService.query<GetActiveCustomerQuery>(GET_ACTIVE_CUSTOMER, {}, 'network-only').pipe(
            map(data => data.activeCustomer),
            filter(notNullOrUndefined),
        ).subscribe(customer => {
            this.form = this.formBuilder.group({
                firstName: customer.firstName,
                lastName: customer.lastName,
                phoneNumber: customer.phoneNumber,
            });
            this.changeDetectorRef.markForCheck();
        });
    }

    updateDetails() {
        const formValue = this.form.value;
        const input: UpdateCustomerInput = {
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            phoneNumber: formValue.phoneNumber,
        };
        this.dataService.mutate<UpdateCustomerDetailsMutation, UpdateCustomerDetailsMutationVariables>(UPDATE_CUSTOMER_DETAILS, {
            input,
        }).subscribe(() => {
            this.form.markAsPristine();
        });
    }

}
