import { effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { map, merge, scan, Subject } from 'rxjs';
import { LogEventAction, UserEvent } from './user-event-tracker';

@Injectable({
  providedIn: 'root',
})
export class UserEventTrackerService {
  private readonly router = inject(Router);

  /** trigger when an user event happens that we want to log */
  readonly accumulateLog$ = new Subject<LogEventAction>();

  /** trigger to reset the accumulated logs */
  private readonly resetLogs$ = new Subject<void>();

  /** accumulate every user event that happens */
  readonly accumulatedLogs = toSignal(
    merge(
      // saved triggered logs by the app
      this.accumulateLog$.pipe(
        map((action) => ({
          type: 'add' as const,
          action: {
            ...action,
            time: new Date().toLocaleTimeString(),
            page: this.router.url,
          },
        })),
      ),
      // reset logs
      this.resetLogs$.pipe(map(() => ({ type: 'reset' as const }))),
    ).pipe(scan((acc, curr) => (curr.type === 'add' ? [...acc, curr.action] : []), [] as UserEvent[])),
    { initialValue: [] },
  );

  readonly accumulatedLogsEff = effect(() => console.log(this.accumulatedLogs()));

  saveLogs(): void {
    const logChunks = 120;
    const logFormatChunks = this.accumulatedLogs()
      .reduce((acc: UserEvent[][], curr: UserEvent, index: number) => {
        if (index % logChunks === 0) {
          acc.push([]);
        }

        acc[acc.length - 1].push(curr);

        return acc;
      }, [] as UserEvent[][])
      .map((logChunk, index) => ({
        log_message: `Page Events ${index + 1}`,
        context: logChunk,
      }));

    // save all log chunks
    for (const logFormat of logFormatChunks) {
      this.sendToRemoteByFetch(logFormat);
    }

    // trigger reset all previous logs
    this.resetLogs$.next();
  }

  private sendToRemoteByFetch(body: unknown): void {
    const xsrfToken = this.getCookie('XSRF-TOKEN');

    fetch('api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      },
      credentials: 'include',
      keepalive: true, // keep the connection alive when app closes
      body: JSON.stringify(body),
    });
  }

  private getCookie(name: string): string | null {
    const matches = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'));
    return matches ? decodeURIComponent(matches[1]) : null;
  }
}
