import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, RouterModule } from '@angular/router';

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
  name = 'ee';
}

bootstrapApplication(App, {
  providers: [
    provideRouter([
      {
        path: '',
        redirectTo: '/welcome',
        pathMatch: 'full',
      },
      {
        path: 'welcome',
        loadComponent: () =>
          import('./pages/page-welcome/page-welcome.component').then(
            (m) => m.PageWelcomeComponent,
          ),
      },
      {
        path: 'thank-you',
        loadComponent: () =>
          import('./pages/page-thank-you/page-thank-you.component').then(
            (m) => m.PageThankYouComponent,
          ),
      },
    ]),
    provideAnimationsAsync(),
  ],
});
