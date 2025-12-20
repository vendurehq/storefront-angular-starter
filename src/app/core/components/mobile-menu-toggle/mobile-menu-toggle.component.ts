import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { StateService } from '../../providers/state/state.service';

@Component({
    standalone: false,
    selector: 'vsf-mobile-menu-toggle',
    templateUrl: './mobile-menu-toggle.component.html',
    // styleUrls: ['./mobile-menu-toggle.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileMenuToggleComponent {
    private stateService = inject(StateService);


    toggle() {
        this.stateService.setState('mobileNavMenuIsOpen', true);
    }
}
