import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-page-thank-you',
  imports: [],
  standalone: true,
  template: `<p>page-thank-you works!</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageThankYouComponent {}
