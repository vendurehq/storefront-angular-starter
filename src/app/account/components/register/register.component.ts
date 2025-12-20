import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';

import { RegisterMutation, RegisterMutationVariables } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';

import { REGISTER } from './register.graphql';

@Component({
    standalone: false,
    selector: 'vsf-register',
    templateUrl: './register.component.html',
    // styleUrls: ['./register.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
    private dataService = inject(DataService);
    private changeDetector = inject(ChangeDetectorRef);

    firstName: string;
    lastName: string;
    emailAddress: string;
    registrationSent = false;

    register() {
        this.dataService.mutate<RegisterMutation, RegisterMutationVariables>(REGISTER, {
            input: {
                emailAddress: this.emailAddress,
                firstName: this.firstName,
                lastName: this.lastName,
            },
        }).subscribe(() => {
            this.registrationSent = true;
            this.changeDetector.markForCheck();
        });
    }
}
