import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { Subject } from 'rxjs';

import { NotificationOptions, NOTIFICATION_OPTIONS } from '../../providers/notification/notification-types';

@Component({
    standalone: false,
    selector: 'vsf-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
    options = inject<NotificationOptions>(NOTIFICATION_OPTIONS);

    close = new Subject();
}
