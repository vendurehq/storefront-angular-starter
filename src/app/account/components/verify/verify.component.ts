import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { VerifyMutation, VerifyMutationVariables } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';

import { VERIFY } from './verify.graphql';

@Component({
    standalone: false,
    selector: 'vsf-verify',
    templateUrl: './verify.component.html',
    // styleUrls: ['./verify.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class VerifyComponent {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private dataService = inject(DataService);
    private stateService = inject(StateService);

    password = '';

    verify() {
        const password = this.password;
        const token = this.route.snapshot.queryParamMap.get('token');

        if (password && token) {
            this.dataService.mutate<VerifyMutation, VerifyMutationVariables>(VERIFY, {
                password,
                token,
            }).subscribe(() => {
                this.stateService.setState('signedIn', true);
                this.router.navigate(['/account']);
            });
        }
    }
}
