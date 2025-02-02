import { DOCUMENT } from '@angular/common';
import { inject, Injectable, NgZone } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, merge } from 'rxjs';
import { LogEventAction } from './user-event-tracker';
import { UserEventTrackerService } from './user-event-tracker.service';

@Injectable({
  providedIn: 'root',
})
export class UserEventListenerService {
  private readonly userEventTrackerService = inject(UserEventTrackerService);
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  /**
   * navigation change: page1
   */
  private readonly routerChange$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map((routerData) => routerData['url']),
  );

  start() {
    merge(
      // open dialog log
      this.dialog.afterOpened.pipe(
        map(
          (dialogRef) =>
            ({
              type: 'openDialog',
              componentName: dialogRef.componentRef?.componentType.name ?? 'Unknown',
            }) satisfies LogEventAction,
        ),
      ),
      // close dialog log
      this.dialog.afterAllClosed.pipe(map(() => ({ type: 'closeDialog' }) satisfies LogEventAction)),
      // router change log
      this.routerChange$.pipe(
        map((pageName) => ({ type: 'routerChange', text: pageName }) satisfies LogEventAction),
      ),
    )
      .pipe(takeUntilDestroyed())
      .subscribe((res) => this.userEventTrackerService.accumulateLog$.next(res));

    this.ngZone.runOutsideAngular(() => {
      // listen on click events
      this.document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        //console.log(event);

        // mat-button click
        if (target.tagName === 'SPAN') {
          if (target?.parentElement?.tagName === 'BUTTON') {
            this.userEventTrackerService.accumulateLog$.next({
              type: 'clickElement',
              elementType: 'BUTTON',
              value: target?.parentElement?.ariaLabel || target?.parentElement?.innerText || 'Unknown',
            });
          }
        }
        // anchor click
        else if (target.tagName === 'A') {
          this.userEventTrackerService.accumulateLog$.next({
            type: 'clickElement',
            elementType: 'LINK',
            value: target?.ariaLabel || target?.innerText || 'Unknown',
          });
        }
        // mat-option click
        else if (target.tagName === 'MAT-OPTION') {
          this.userEventTrackerService.accumulateLog$.next({
            type: 'clickElement',
            elementType: 'MAT-OPTION',
            value: target?.ariaLabel || target?.innerText || 'Unknown',
          });
        }
      });

      //   this.document.addEventListener(
      //     'submit',
      //     (event) => {
      //       const formElement = event.target as HTMLFormElement;
      //       console.log(formElement);
      //     },
      //     true,
      //   );

      // listen on input change events
      this.document.addEventListener(
        'change',
        (event) => {
          const el = event.target as HTMLElement;
          const elType = (el as any)?.['type'];

          if (elType === 'checkbox') {
            this.userEventTrackerService.accumulateLog$.next({
              type: 'inputChange',
              elementType: 'CHECKBOX',
              elementLabel: el.getAttribute('aria-label') ?? 'Unknown',
              value: (el as HTMLInputElement).checked,
            });
          } else if (elType === 'radio') {
            this.userEventTrackerService.accumulateLog$.next({
              type: 'inputChange',
              elementType: 'RADIO',
              elementLabel: el.getAttribute('aria-label') ?? 'Unknown',
              value: (el as HTMLInputElement).value,
            });
          } else if (el.tagName === 'INPUT') {
            this.userEventTrackerService.accumulateLog$.next({
              type: 'inputChange',
              elementType: 'INPUT',
              elementLabel: el.getAttribute('aria-label') ?? 'Unknown',
              value: (el as HTMLInputElement).value,
            });
          }
        },
        true,
      );
    });
  }
}
