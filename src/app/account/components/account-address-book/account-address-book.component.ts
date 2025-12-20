import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { GetCustomerAddressesQuery } from '../../../common/generated-types';
import { GET_CUSTOMER_ADDRESSES } from '../../../common/graphql/documents.graphql';
import { DataService } from '../../../core/providers/data/data.service';

@Component({
    standalone: false,
    selector: 'vsf-account-address-book',
    templateUrl: './account-address-book.component.html',
    // styleUrls: ['./account-address-book.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountAddressBookComponent implements OnInit {
    private dataService = inject(DataService);


    addresses$: Observable<NonNullable<GetCustomerAddressesQuery['activeCustomer']>['addresses'] | undefined>;

    ngOnInit() {
        this.addresses$ = this.dataService.query<GetCustomerAddressesQuery>(GET_CUSTOMER_ADDRESSES).pipe(
            map(data => data.activeCustomer && data.activeCustomer.addresses),
        );
    }

}
