import { Directive, HostListener, inject, NgModule } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { getFormValidationState } from './user-event-logging.utils';
import { UserEventTrackerService } from './user-event-tracker.service';

/**
 * track form submission
 */
@Directive({
  selector: 'form[formGroup]',
  standalone: true,
})
export class FormSubmitDirective {
  private readonly formGroupDirective = inject(FormGroupDirective);
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  @HostListener('ngSubmit')
  onSubmit() {
    const form = this.formGroupDirective.form;
    const isValid = form.valid;
    const values = form.getRawValue();

    if (isValid) {
      this.userEventTrackerService.userEventChange$.next({
        type: 'formSubmitValid',
        values,
      });
    } else {
      this.userEventTrackerService.userEventChange$.next({
        type: 'formSubmitInvalid',
        values,
        fieldValidity: getFormValidationState(form),
      });
    }
  }
}

@Directive({
  selector: 'input, select, mat-select',
  standalone: true,
})
export class CommonFocusDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent) {
    const target = event.target as HTMLElement;

    this.userEventTrackerService.userEventChange$.next({
      type: 'focusElement',
      element: target.tagName,
    });
  }

  @HostListener('blur', ['$event'])
  onLeave(event: FocusEvent) {
    const inputTarget = event.target as HTMLInputElement;
    const inputText = inputTarget.value ?? inputTarget.textContent;

    // no need to track if there is no text
    if (!inputText) {
      return;
    }

    this.userEventTrackerService.userEventChange$.next({
      type: 'blurElement',
      element: inputTarget.tagName,
      text: inputText,
    });
  }
}

@Directive({
  selector: 'button, a',
  standalone: true,
})
export class CommonClickDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const usedTarget = target.tagName === 'SPAN' ? target.parentElement : target;

    // mat-button is represented as 'span'
    this.userEventTrackerService.userEventChange$.next({
      type: 'clickElement',
      element: usedTarget?.tagName ?? '',
      text: usedTarget?.innerText ?? '',
    });
  }
}

const directives = [FormSubmitDirective, CommonFocusDirective, CommonClickDirective];

@NgModule({
  imports: [...directives],
  exports: [...directives],
})
export class UserEventTrackerModule {}
