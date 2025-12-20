import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    standalone: false,
    selector: 'vsf-layout-footer',
    template: '<ng-content></ng-content>',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutFooterComponent {
}
