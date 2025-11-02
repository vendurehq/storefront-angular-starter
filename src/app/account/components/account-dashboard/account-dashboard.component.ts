import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { GetAccountOverviewQuery } from '../../../common/generated-types';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';

import { GET_ACCOUNT_OVERVIEW } from './account-dashboard.graphql';

@Component({
    standalone: false,
    selector: 'vsf-account-dashboard',
    templateUrl: './account-dashboard.component.html',
    // styleUrls: ['./account-dashboard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDashboardComponent implements OnInit {
    private dataService = inject(DataService);
    private stateService = inject(StateService);
    private router = inject(Router);


    activeCustomer$: Observable<GetAccountOverviewQuery['activeCustomer']>;

    ngOnInit() {
        this.activeCustomer$ = this.dataService.query<GetAccountOverviewQuery>(GET_ACCOUNT_OVERVIEW).pipe(
            map(data => data.activeCustomer),
            filter(notNullOrUndefined),
        );
    }
}
