import { Directive, HostListener, inject, NgModule } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
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
      this.userEventTrackerService.accumulateLog$.next({
        type: 'formSubmitValid',
        values,
      });
    } else {
      this.userEventTrackerService.accumulateLog$.next({
        type: 'formSubmitInvalid',
        values,
        fieldValidity: getFormValidationState(form),
      });
    }
  }
}

@Directive({
  selector: 'input, textarea',
  standalone: true,
})
export class EventInputsDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);
  private previousValue: string | null = null;

  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent) {
    const inputTarget = event.target as HTMLInputElement | HTMLTextAreaElement;

    // store value when focused
    this.previousValue = inputTarget.value;
  }

  @HostListener('blur', ['$event'])
  onLeave(event: FocusEvent) {
    const inputTarget = event.target as HTMLInputElement | HTMLTextAreaElement;
    const newValue = inputTarget.value;
    const prevValue = this.previousValue;
    const labelName = inputTarget?.labels?.[0]?.innerText?.trim() ?? 'Unknown';

    // same value, no need to log
    if (newValue === prevValue) {
      return;
    }

    this.userEventTrackerService.accumulateLog$.next({
      type: 'inputChange',
      elementType: inputTarget.tagName,
      elementLabel: labelName,
      value: newValue,
    });

    // update the stored value
    this.previousValue = newValue;
  }
}

@Directive({
  selector: 'mat-select',
  standalone: true,
})
export class EventSelectsDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  @HostListener('selectionChange', ['$event'])
  onSelectionChange(event: MatSelectChange) {
    const selectedValue = event.value;
    const nativeEl = event.source._elementRef.nativeElement;
    const label =
      nativeEl
        ?.closest('mat-form-field')
        ?.querySelector('mat-label')
        ?.textContent?.trim() ?? 'Unknown';

    this.userEventTrackerService.accumulateLog$.next({
      type: 'inputChange',
      elementLabel: label,
      elementType: 'MAT-SELECT',
      value: selectedValue,
    });
  }
}

@Directive({
  selector: 'button, a',
  standalone: true,
})
export class EventButtonDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const inputTarget = event.target as HTMLElement;

    // mat-button is represented as 'span'
    const usedTarget =
      inputTarget.tagName === 'SPAN' ? inputTarget.parentElement : inputTarget;

    this.userEventTrackerService.accumulateLog$.next({
      type: 'clickElement',
      elementType: usedTarget?.tagName ?? '',
      value: usedTarget?.innerText ?? '',
    });
  }
}

const directives = [
  FormSubmitDirective,
  EventInputsDirective,
  EventButtonDirective,
  EventSelectsDirective,
];

@NgModule({
  imports: [...directives],
  exports: [...directives],
})
export class UserEventTrackerModule {}
