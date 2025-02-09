import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Component, HostListener, inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, RouterModule } from '@angular/router';
import {
  UserEventListenerService,
  userEventLoggingInterceptorProvider,
  UserEventTrackerService,
} from './user-event-tracker';

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  standalone: true,
  template: `
    <div class="mt-[200px]">
      <router-outlet />
    </div>
  `,
})
export class App {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  @HostListener('window:beforeunload')
  onPageRefresh() {
    this.userEventTrackerService.saveLogsRemote();
  }
}

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withInterceptors([userEventLoggingInterceptorProvider])),
    provideRouter([
      {
        path: '',
        redirectTo: '/welcome',
        pathMatch: 'full',
      },
      {
        path: 'welcome',
        loadComponent: () =>
          import('./pages/page-welcome/page-welcome.component').then((m) => m.PageWelcomeComponent),
      },
      {
        path: 'thank-you',
        loadComponent: () =>
          import('./pages/page-thank-you/page-thank-you.component').then((m) => m.PageThankYouComponent),
      },
      {
        path: '**',
        redirectTo: '/welcome',
      },
    ]),
    provideAppInitializer(() => {
      const userEventListenerService = inject(UserEventListenerService);
      userEventListenerService.start();
    }),
    provideAnimationsAsync(),
  ],
});
