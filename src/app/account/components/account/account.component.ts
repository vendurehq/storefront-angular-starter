import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { SignOutMutation } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';

import { SIGN_OUT } from './account.graphql';

@Component({
    standalone: false,
    selector: 'vsf-account',
    templateUrl: './account.component.html',
    // styleUrls: ['./account.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
    private dataService = inject(DataService);
    private stateService = inject(StateService);
    private router = inject(Router);


    isSignedIn$: Observable<boolean>;

    constructor() {
        this.isSignedIn$ = this.stateService.select(state => state.signedIn);
    }

    signOut() {
        this.dataService.mutate<SignOutMutation>(SIGN_OUT).subscribe({
            next: () => {
                this.stateService.setState('signedIn', false);
                this.router.navigate(['/']);
            },
        });
    }
}
