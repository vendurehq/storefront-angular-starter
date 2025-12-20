import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { GetActiveCustomerQuery } from '../../../common/generated-types';
import { GET_ACTIVE_CUSTOMER } from '../../../common/graphql/documents.graphql';
import { DataService } from '../../providers/data/data.service';
import { StateService } from '../../providers/state/state.service';

@Component({
    standalone: false,
    selector: 'vsf-account-link',
    templateUrl: './account-link.component.html',
    // styleUrls: ['./account-link.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountLinkComponent implements OnInit {
    private dataService = inject(DataService);
    private stateService = inject(StateService);


    activeCustomer$: Observable<GetActiveCustomerQuery['activeCustomer']>;

    ngOnInit() {
        const getActiveCustomer$ = this.dataService.query<GetActiveCustomerQuery>(GET_ACTIVE_CUSTOMER, {}, 'network-only');

        getActiveCustomer$.pipe(take(1)).subscribe(data => {
            if (data.activeCustomer) {
                this.stateService.setState('signedIn', true);
            }
        });

        this.activeCustomer$ = this.stateService.select(state => state.signedIn).pipe(
            switchMap(() => getActiveCustomer$),
            map(data => data && data.activeCustomer),
        );
    }

    userName(customer: NonNullable<GetActiveCustomerQuery['activeCustomer']>): string {
        const { firstName, lastName, emailAddress } = customer;
        if (firstName && lastName) {
            return `${firstName} ${lastName}`;
        } else {
            return emailAddress;
        }
    }

}
