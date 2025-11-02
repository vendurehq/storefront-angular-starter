import { isPlatformBrowser } from '@angular/common';
import { NgModule, PLATFORM_ID, DOCUMENT, inject } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterModule, UrlSerializer } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { HomePageComponent } from './core/components/home-page/home-page.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
    declarations: [
        AppComponent,
        HomePageComponent,
    ],
    imports: [
        BrowserModule,
        // Hydration and enabledBlocking initial navigation conflict; omit initialNavigation when hydrating.
        RouterModule.forRoot(routes, { scrollPositionRestoration: 'disabled' }),
        CoreModule,
        SharedModule,
        // Using the service worker appears to break SSR after the initial page load.
        // ServiceWorkerModule.register(`${environment.baseHref}ngsw-worker.js`, {
        //     enabled: environment.production,
        //     registrationStrategy: 'registerWithDelay:5000',
        // }),
    ],
    bootstrap: [AppComponent],
    providers: [
        // Enable client-side hydration for SSR
        provideClientHydration()
    ]
})
export class AppModule {
    private router = inject(Router);
    private urlSerializer = inject(UrlSerializer);
    private platformId = inject(PLATFORM_ID);
    private document = inject<Document>(DOCUMENT);


    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            this.handleScrollOnNavigations();
        }
    }

    /**
     * A work-around for undesirable scoll behaviour caused by the router's `scrollPositionRestoration` setting.
     * When set to 'enabled', it correctly handles scrolling to the top on navigation, and preserving scroll position
     * on "back" navigation. However, it _also_ causes the page to scroll to the top when changing search facet value filters,
     * which is very undesirable. Since there seems to be currently no way to disable the scrolling on a per-navigation basis,
     * we are manually implementing scroll-to-top-on-nav and adding an exception for when the "facets" param of the "category"
     * routes change.
     */
    private handleScrollOnNavigations() {
        this.router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        ).subscribe(event => {
            if (this.document?.defaultView) {
                const parsed = this.urlSerializer.parse(event.urlAfterRedirects);
                const primaryRoot = parsed.root.children['primary'];
                const isFacetFilterNavigation = (primaryRoot?.segments[0]?.path === 'category' &&
                    primaryRoot?.segments[1]?.parameterMap.has('facets'));

                if (!isFacetFilterNavigation) {
                    this.document.defaultView.scrollTo({
                        top: 0,
                    });
                }
            }
        });
    }
}
