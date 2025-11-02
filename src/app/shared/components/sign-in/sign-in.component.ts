import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';

import { SignInMutation, SignInMutationVariables } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';

import { SIGN_IN } from './sign-in.graphql';

@Component({
    standalone: false,
    selector: 'vsf-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
    private dataService = inject(DataService);
    private stateService = inject(StateService);
    private router = inject(Router);
    private changeDetector = inject(ChangeDetectorRef);

    @Input() navigateToOnSuccess: any[] | undefined;
    @Input() displayRegisterLink = true;

    emailAddress: string;
    password: string;
    rememberMe = false;
    invalidCredentials = false;

    signIn() {
        this.dataService.mutate<SignInMutation, SignInMutationVariables>(SIGN_IN, {
            emailAddress: this.emailAddress,
            password: this.password,
            rememberMe: this.rememberMe,
        }).subscribe({
            next: ({login}) => {
                switch (login.__typename) {
                    case 'CurrentUser':
                        this.stateService.setState('signedIn', true);
                        const commands = this.navigateToOnSuccess || ['/'];
                        this.router.navigate(commands);
                        break;
                    case 'NativeAuthStrategyError':
                    case 'InvalidCredentialsError':
                        this.displayCredentialsError();
                        break;
                }
            },
        });
    }

    private displayCredentialsError() {
        this.invalidCredentials = false;
        this.changeDetector.markForCheck();
        setTimeout(() => {
            this.invalidCredentials = true;
            this.changeDetector.markForCheck();
        }, 50);
    }
}
