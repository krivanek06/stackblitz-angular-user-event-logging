import { DOCUMENT } from '@angular/common';
import { inject, Injectable, NgZone } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { filter, map, merge, pairwise, scan, Subject } from 'rxjs';
import { LogEventAction, UserEvent } from './user-event-tracker';

@Injectable({
  providedIn: 'root',
})
export class UserEventTrackerService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  // private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly ngZone = inject(NgZone);

  /**
   * trigger when an user event happens that we want to log
   */
  readonly userEventChange$ = new Subject<LogEventAction>();

  /**
   * trigger to reset the accumulated logs
   */
  private readonly resetLogs$ = new Subject<void>();

  /**
   * navigation change: page1 -> page2
   */
  private readonly routerChange$ = this.router.events.pipe(
    filter((event): event is NavigationStart => event instanceof NavigationStart),
    map((routerData) => routerData['url']),
    pairwise(),
    map((routes) => routes.join(' -> ')),
  );

  /**
   * accumulate every user event that happens on a page
   */
  private readonly userEventChangeOnPage = toSignal(
    merge(
      merge(
        // saved triggered logs by the app
        this.userEventChange$.pipe(map((action) => this.createLogFormat(action))),
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
      map((logs) => this.sortLogsByPriority(logs)),
    ),
    { initialValue: [] },
  );

  start(): void {
    this.ngZone.runOutsideAngular(() => {
      this.document.addEventListener('click', (event: FocusEvent) => {
        const castedTarget: HTMLElement = event.target as HTMLElement;
        const formControlRegex: RegExp = /data-formcontrolname="([^"]*)"/;
        const formControlNameArr = (event.target as HTMLElement)?.outerHTML.match(
          formControlRegex,
        );

        if (formControlNameArr && formControlNameArr[1]) {
          this.userEventChange$.next({
            type: 'formControlClick',
            name: formControlNameArr[1],
          });
        } else if (castedTarget.tagName === 'BUTTON') {
          this.userEventChange$.next({
            type: 'buttonClick',
            text: castedTarget.innerText,
          });
        } else if (castedTarget.tagName === 'A') {
          this.userEventChange$.next({
            type: 'anchorClick',
            text: castedTarget.innerText,
          });
        }
      });
    });
  }

  saveLogs(): void {
    const logChunks: number = 120;
    const logFormatChunks = this.userEventChangeOnPage()
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

  /**
   * sort logs by time and then prioritize buttonClick if time is the same
   */
  private sortLogsByPriority(logs: UserEvent[]): UserEvent[] {
    return logs.sort((a, b) => {
      if (a.time === b.time) {
        return a.type === 'buttonClick' ? -1 : 1;
      }

      return a.time < b.time ? -1 : 1;
    });
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
      keepalive: true,
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
