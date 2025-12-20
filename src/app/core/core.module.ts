import { APP_BASE_HREF } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { provideApollo } from 'apollo-angular';
import { ApolloClient } from '@apollo/client/core';
import { inject } from '@angular/core';
import { HttpLink } from 'apollo-angular/http';
import { PLATFORM_ID, TransferState } from '@angular/core';
import { REQUEST } from '../../express.tokens';
import type { Request } from 'express';
import { apolloOptionsFactory } from './apollo-client-provider';


import { environment } from '../../environments/environment';
import { SharedModule } from '../shared/shared.module';

// Apollo client is provided via provideApollo below using apolloOptionsFactory
import { AccountLinkComponent } from './components/account-link/account-link.component';
import { AssetGalleryComponent } from './components/asset-gallery/asset-gallery.component';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';
import { CartToggleComponent } from './components/cart-toggle/cart-toggle.component';
import { CollectionBreadcrumbsComponent } from './components/collection-breadcrumbs/collection-breadcrumbs.component';
import { CollectionsMenuMobileComponent } from './components/collections-menu-mobile/collections-menu-mobile.component';
import { CollectionsMenuComponent } from './components/collections-menu/collections-menu.component';
import { LayoutFooterComponent } from './components/layout/layout-footer.component';
import { LayoutHeaderComponent } from './components/layout/layout-header.component';
import { LayoutComponent } from './components/layout/layout.component';
import { MobileMenuToggleComponent } from './components/mobile-menu-toggle/mobile-menu-toggle.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductListControlsComponent } from './components/product-list-controls/product-list-controls.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductSearchBarComponent } from './components/product-search-bar/product-search-bar.component';
import { TopReviewsComponent } from './components/top-reviews/top-reviews.component';
import { buildIconLibrary } from './icon-library';
import { DefaultInterceptor } from './providers/data/interceptor';

const CORE_COMPONENTS = [
    ProductListComponent,
    ProductDetailComponent,
    CartToggleComponent,
    AccountLinkComponent,
    CartDrawerComponent,
    LayoutComponent,
    LayoutHeaderComponent,
    LayoutFooterComponent,
    CollectionsMenuComponent,
    CollectionsMenuMobileComponent,
    MobileMenuToggleComponent,
    ProductCardComponent,
    CollectionBreadcrumbsComponent,
    ProductListControlsComponent,
    ProductSearchBarComponent,
    AssetGalleryComponent,
];

@NgModule({
    declarations: [
        ...CORE_COMPONENTS,
        TopReviewsComponent,
    ],
    exports: [
        ...CORE_COMPONENTS,
    ],
    imports: [
        SharedModule,
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true },
        { provide: APP_BASE_HREF, useValue: environment.baseHref },
        // Ensure HttpLink is available even without an NgModule
        { provide: HttpLink, useFactory: () => new HttpLink(inject(HttpClient)) },
        // Enable fetch for SSR performance/compat and keep DI interceptors
        provideHttpClient(withFetch(), withInterceptorsFromDi()),
        provideApollo(() => new ApolloClient(
            apolloOptionsFactory(
                inject(HttpLink),
                inject(PLATFORM_ID),
                inject(TransferState),
                inject<Request | null>(REQUEST, { optional: true }) || undefined,
            )
        )),
    ] })
export class CoreModule {
    constructor() {
        const library = inject(FaIconLibrary);

        buildIconLibrary(library);
    }
}
