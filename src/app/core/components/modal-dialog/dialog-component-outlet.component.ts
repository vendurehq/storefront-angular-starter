import { Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output, Type, ViewContainerRef, inject } from '@angular/core';

/**
 * A helper component used to embed a component instance into the {@link ModalDialogComponent}
 */
@Component({
    standalone: false,
    selector: 'vsf-dialog-component-outlet',
    template: ``,
})
export class DialogComponentOutletComponent implements OnInit {
    private viewContainerRef = inject(ViewContainerRef);
    private componentFactoryResolver = inject(ComponentFactoryResolver);

    @Input() component: Type<any>;
    @Output() create = new EventEmitter<any>();

    ngOnInit() {
        const factory = this.componentFactoryResolver.resolveComponentFactory(this.component);
        const componentRef = this.viewContainerRef.createComponent(factory);
        this.create.emit(componentRef.instance);
    }
}
