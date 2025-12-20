import { Directive, OnInit, TemplateRef, inject } from '@angular/core';

import { ModalDialogComponent } from './modal-dialog.component';

/**
 * A helper directive used to correctly embed the modal title in the {@link ModalDialogComponent}.
 */
@Directive({  standalone: false, selector: '[vsfDialogTitle]' })
export class DialogTitleDirective implements OnInit {
    private modal = inject<ModalDialogComponent<any>>(ModalDialogComponent);
    private templateRef = inject<TemplateRef<any>>(TemplateRef);


    ngOnInit() {
        this.modal.registerTitleTemplate(this.templateRef);
    }
}
