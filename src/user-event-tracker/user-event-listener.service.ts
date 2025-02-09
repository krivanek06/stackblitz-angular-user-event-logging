import { DOCUMENT } from '@angular/common';
import { afterNextRender, inject, Injectable, NgZone } from '@angular/core';
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

  start() {
    afterNextRender(() => {
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
        this.router.events.pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          map((routerData) => ({ type: 'routerChange', text: routerData['url'] }) satisfies LogEventAction),
        ),
      ).subscribe((res) => this.userEventTrackerService.createLog(res));

      this.ngZone.runOutsideAngular(() => {
        // listen on click events
        this.document.addEventListener(
          'click',
          (event) => {
            const target = event.target as HTMLElement;
            // console.log(event);

            if (target.tagName === 'SPAN') {
              if (target?.parentElement?.tagName === 'BUTTON') {
                this.userEventTrackerService.createLog({
                  type: 'clickElement',
                  elementType: 'BUTTON',
                  value:
                    target?.parentElement?.dataset['label'] || target?.parentElement?.innerText || 'Unknown',
                });
              }
            } else if (target.tagName === 'A') {
              this.userEventTrackerService.createLog({
                type: 'clickElement',
                elementType: 'LINK',
                value: target?.dataset['label'] || target?.innerText || 'Unknown',
              });
            } else if (target.tagName === 'MAT-OPTION') {
              this.userEventTrackerService.createLog({
                type: 'inputChange',
                elementType: 'MAT-OPTION',
                elementLabel: target?.dataset['label'] ?? 'Unknown',
                value: target?.innerText || 'Unknown',
              });
            }
          },
          true,
        );

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
              this.userEventTrackerService.createLog({
                type: 'inputChange',
                elementType: 'CHECKBOX',
                elementLabel: el.parentElement?.parentElement?.parentElement?.dataset['label'] ?? 'Unknown',
                value: (el as HTMLInputElement).checked,
              });
            } else if (elType === 'radio') {
              const parent = el.parentElement?.parentElement?.parentElement?.parentElement;
              this.userEventTrackerService.createLog({
                type: 'inputChange',
                elementType: 'RADIO',
                elementLabel: parent?.dataset['label'] ?? 'Unknown',
                value: (el as HTMLInputElement).value,
              });
            } else if (el.tagName === 'INPUT') {
              this.userEventTrackerService.createLog({
                type: 'inputChange',
                elementType: 'INPUT',
                elementLabel: el.dataset['label'] ?? 'Unknown',
                value: (el as HTMLInputElement).value,
              });
            }
          },
          true,
        );
      });
    });
  }
}
