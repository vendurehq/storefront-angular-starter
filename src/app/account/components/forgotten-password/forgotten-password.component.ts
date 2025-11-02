import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { RequestPasswordResetMutation, RequestPasswordResetMutationVariables } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';

import { REQUEST_PASSWORD_RESET } from './forgotten-password.graphql';

@Component({
    standalone: false,
    selector: 'vsf-forgotten-password',
    templateUrl: './forgotten-password.component.html',
    styleUrls: ['./forgotten-password.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class ForgottenPasswordComponent {
    private dataService = inject(DataService);
    private route = inject(ActivatedRoute);

    emailAddress = '';
    submitted = false;

    constructor() {
        this.emailAddress = this.route.snapshot.paramMap.get('email') ?? '';
    }

    resetPassword() {
        this.dataService.mutate<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>(REQUEST_PASSWORD_RESET, {
            emailAddress: this.emailAddress,
        }).subscribe(() => {
            this.submitted = true;
        });
    }
}
