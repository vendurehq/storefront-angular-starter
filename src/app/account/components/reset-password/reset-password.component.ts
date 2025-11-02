import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ResetPasswordMutation, ResetPasswordMutationVariables } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';

import { RESET_PASSWORD } from './reset-password.graphql';

@Component({
    standalone: false,
    selector: 'vsf-reset-password',
    templateUrl: './reset-password.component.html',
    // styleUrls: ['./reset-password.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
    private dataService = inject(DataService);
    private stateService = inject(StateService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    password = '';
    error = '';
    private readonly token: string | undefined;

    constructor() {
        this.token = this.route.snapshot.queryParamMap.get('token') || undefined;
        if (!this.token) {
            this.error = 'No token provided! Cannot reset password.';
        }
    }

    confirmPasswordReset() {
        if (this.token) {
            this.dataService.mutate<ResetPasswordMutation, ResetPasswordMutationVariables>(RESET_PASSWORD, {
                token: this.token,
                password: this.password,
            })
                .subscribe(
                    () => {
                        this.stateService.setState('signedIn', true);
                        this.router.navigate(['/account']);
                    },
                );
        }
    }
}
