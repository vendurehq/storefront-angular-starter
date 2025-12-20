import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { VerifyChangeEmailAddressMutation, VerifyChangeEmailAddressMutationVariables } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';

import { VERIFY_CHANGE_EMAIL_ADDRESS } from './change-email-address.graphql';

@Component({
    standalone: false,
    selector: 'vsf-change-email-address',
    templateUrl: './change-email-address.component.html',
    // styleUrls: ['./change-email-address.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class ChangeEmailAddressComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private dataService = inject(DataService);
    private stateService = inject(StateService);

    message = 'Verifying new email address...';
    state: 'error' | 'success' | 'pending' = 'pending';

    ngOnInit() {
        this.verify();
    }

    verify() {
        const token = this.route.snapshot.queryParamMap.get('token');

        if (token) {
            this.dataService.mutate<VerifyChangeEmailAddressMutation, VerifyChangeEmailAddressMutationVariables>(VERIFY_CHANGE_EMAIL_ADDRESS, {
                token,
            }).subscribe(
                () => {
                    this.message = 'Your new email address has been verified!';
                    this.state = 'success';
                },
                err => {
                    this.state = 'error';
                    this.message = err.message;
                });
        } else {
            this.message = 'No token provided! Cannot verify email address.';
            this.state = 'error';
        }
    }
}
