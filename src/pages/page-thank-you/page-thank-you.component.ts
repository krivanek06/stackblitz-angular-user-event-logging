import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UserEventTrackerService } from '../../user-event-tracker';

@Component({
  selector: 'app-page-thank-you',
  imports: [JsonPipe],
  standalone: true,
  template: `
    <div class="p-6">
      <h2 class="text-xl">Summary:</h2>

      <div class="max-h-[750px] overflow-scroll bg-gray-200 py-6">
        <pre>
              {{ accumulatedLogs() | json }}
        </pre
        >
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageThankYouComponent {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  readonly accumulatedLogs = this.userEventTrackerService.accumulatedLogs;
}
