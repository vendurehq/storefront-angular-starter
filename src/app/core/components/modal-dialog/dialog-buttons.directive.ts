import { Directive, OnInit, TemplateRef, inject } from '@angular/core';

import { ModalDialogComponent } from './modal-dialog.component';

/**
 * A helper directive used to correctly embed the modal buttons in the {@link ModalDialogComponent}.
 */
@Directive({  standalone: false, selector: '[vsfDialogButtons]' })
export class DialogButtonsDirective implements OnInit {
    private modal = inject<ModalDialogComponent<any>>(ModalDialogComponent);
    private templateRef = inject<TemplateRef<any>>(TemplateRef);


    ngOnInit() {
        this.modal.registerButtonsTemplate(this.templateRef);
    }
}
