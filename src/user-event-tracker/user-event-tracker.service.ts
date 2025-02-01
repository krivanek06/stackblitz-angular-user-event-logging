import { effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, merge, scan, Subject } from 'rxjs';
import { LogEventAction, UserEvent } from './user-event-tracker';

@Injectable({
  providedIn: 'root',
})
export class UserEventTrackerService {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  /**
   * trigger when an user event happens that we want to log
   */
  readonly accumulateLog$ = new Subject<LogEventAction>();

  /**
   * trigger to reset the accumulated logs
   */
  private readonly resetLogs$ = new Subject<void>();

  /**
   * navigation change: page1
   */
  private readonly routerChange$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map((routerData) => routerData['url']),
  );

  /**
   * accumulate every user event that happens on a page
   */
  private readonly accumulatedLogs = toSignal(
    merge(
      merge(
        // saved triggered logs by the app
        this.accumulateLog$.pipe(map((action) => this.createLogFormat(action))),
        // open dialog log
        this.dialog.afterOpened.pipe(
          map((dialogRef) =>
            this.createLogFormat({
              type: 'openDialog',
              componentName: dialogRef.componentRef?.componentType.name ?? 'Unknown',
            }),
          ),
        ),
        // close dialog log
        this.dialog.afterAllClosed.pipe(
          map(() => this.createLogFormat({ type: 'closeDialog' })),
        ),
        // router change log
        this.routerChange$.pipe(
          map((pageName) =>
            this.createLogFormat({ type: 'routerChange', text: pageName }),
          ),
        ),
      ).pipe(
        map((action) => ({
          action,
          type: 'add' as const,
        })),
      ),
      // reset logs
      this.resetLogs$.pipe(map(() => ({ type: 'reset' as const }))),
    ).pipe(
      scan(
        (acc, curr) => (curr.type === 'add' ? [...acc, curr.action] : []),
        [] as UserEvent[],
      ),
    ),
    { initialValue: [] },
  );

  readonly accumulatedLogsEff = effect(() => console.log(this.accumulatedLogs()));

  saveLogs(): void {
    const logChunks: number = 120;
    const logFormatChunks = this.accumulatedLogs()
      .reduce((acc: UserEvent[][], curr: UserEvent, index: number) => {
        if (index % logChunks === 0) {
          acc.push([]);
        }

        acc[acc.length - 1].push(curr);

        return acc;
      }, [] as UserEvent[][])
      .map((logChunk, index) => ({
        log_level: 'INFO',
        log_message: `Page Events ${index + 1}`,
        context: logChunk,
      }));

    // save all log chunks
    for (const logFormat of logFormatChunks) {
      this.sendToRemoteByFetch(logFormat);
    }

    this.resetLogs$.next();
  }

  private createLogFormat(action: LogEventAction): UserEvent {
    return {
      ...action,
      time: new Date().toLocaleTimeString(),
      page: this.router.url,
    };
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
    const matches = document.cookie.match(
      new RegExp('(?:^|; )' + encodeURIComponent(name) + '=([^;]*)'),
    );
    return matches ? decodeURIComponent(matches[1]) : null;
  }
}
