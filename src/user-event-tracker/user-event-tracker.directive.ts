import { Directive, HostListener, inject, NgModule } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatRadioChange } from '@angular/material/radio';
import { MatSelectChange } from '@angular/material/select';
import { getFormValidationState } from './user-event-logging.utils';
import { UserEventTrackerService } from './user-event-tracker.service';

/**
 * track form submission
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
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

// ----------------------------

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'input, textarea',
  standalone: true,
})
export class EventInputsDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  @HostListener('change', ['$event'])
  onFocus(event: FocusEvent) {
    const inputTarget = event.target as HTMLInputElement | HTMLTextAreaElement;
    const labelName = inputTarget.ariaLabel ?? inputTarget?.labels?.[0]?.innerText?.trim() ?? 'Unknown';

    this.userEventTrackerService.accumulateLog$.next({
      type: 'inputChange',
      elementType: inputTarget.tagName,
      elementLabel: labelName,
      value: inputTarget.value,
    });
  }
}

// ----------------------------

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mat-select',
  standalone: true,
})
export class EventSelectsDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  @HostListener('selectionChange', ['$event'])
  onSelectionChange(event: MatSelectChange) {
    const selectedValue = event.value;
    const label = event.source.ariaLabel;

    this.userEventTrackerService.accumulateLog$.next({
      type: 'inputChange',
      elementLabel: label,
      elementType: 'MAT-SELECT',
      value: selectedValue,
    });
  }
}

// ----------------------------

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'button, a',
  standalone: true,
})
export class EventButtonDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const inputTarget = event.target as HTMLElement;

    // mat-button is represented as 'span'
    const usedTarget = inputTarget.tagName === 'SPAN' ? inputTarget.parentElement : inputTarget;

    this.userEventTrackerService.accumulateLog$.next({
      type: 'clickElement',
      elementType: usedTarget?.tagName ?? '',
      value: usedTarget?.ariaLabel || usedTarget?.innerText || 'Unknown',
    });
  }
}

// ----------------------------

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mat-radio-group',
  standalone: true,
})
export class EventButtonRadioDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  @HostListener('change', ['$event'])
  onChange(event: MatRadioChange) {
    const value = event.value;
    const nativeEL = event.source._inputElement.nativeElement;
    const label =
      nativeEL.parentElement?.parentElement?.parentElement?.parentElement?.getAttribute('aria-label');

    this.userEventTrackerService.accumulateLog$.next({
      type: 'inputChange',
      elementType: 'MAT-RADIO',
      elementLabel: label ?? 'Unknown',
      value: value,
    });
  }
}

// ----------------------------

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mat-checkbox',
  standalone: true,
})
export class EventCheckboxDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  @HostListener('change', ['$event'])
  onChange(event: MatCheckboxChange) {
    const value = event.checked;
    const label = event.source.ariaLabel;

    this.userEventTrackerService.accumulateLog$.next({
      type: 'inputChange',
      elementType: 'MAT-CHECKBOX',
      elementLabel: label,
      value: value,
    });
  }
}

// ----------------------------

const directives = [
  FormSubmitDirective,
  EventInputsDirective,
  EventButtonDirective,
  EventSelectsDirective,
  EventButtonRadioDirective,
  EventCheckboxDirective,
];

// @NgModule({
//   imports: [...directives],
//   exports: [...directives],
// })
@NgModule({
  imports: [FormSubmitDirective],
  exports: [FormSubmitDirective],
})
export class UserEventTrackerModule {}
