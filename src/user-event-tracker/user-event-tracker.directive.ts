import { Directive, inject, NgModule } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatRadioChange } from '@angular/material/radio';
import { getFormValidationState } from './user-event-logging.utils';
import { UserEventTrackerService } from './user-event-tracker.service';

/**
 * track form submission
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'form[formGroup]',
  standalone: true,
  host: {
    '(ngSubmit)': 'onSubmit()',
  },
})
export class FormSubmitDirective {
  private readonly formGroupDirective = inject(FormGroupDirective);
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  onSubmit() {
    const form = this.formGroupDirective.form;
    const isValid = form.valid;
    const values = form.getRawValue();

    if (isValid) {
      this.userEventTrackerService.createLog({
        type: 'formSubmitValid',
        values,
      });
    } else {
      this.userEventTrackerService.createLog({
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
  host: {
    '(change)': 'onChange($event)',
  },
})
export class EventInputsDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  onChange(event: FocusEvent) {
    const inputTarget = event.target as HTMLInputElement | HTMLTextAreaElement;
    const labelName =
      inputTarget.dataset['label'] ?? inputTarget?.labels?.[0]?.innerText?.trim() ?? 'Unknown';

    this.userEventTrackerService.createLog({
      type: 'inputChange',
      elementType: `DIRECTIVE-${inputTarget.tagName}`,
      elementLabel: labelName,
      value: inputTarget.value,
    });
  }
}

// ----------------------------

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mat-option',
  standalone: true,
  host: {
    '(click)': 'onSelectionChange($event)',
  },
})
export class EventSelectsDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  onSelectionChange(event: PointerEvent) {
    const target = event.target as HTMLElement;
    const selectedValue = target.innerText;
    const label = target?.dataset['label'] ?? target?.innerText ?? 'Unknown';

    this.userEventTrackerService.createLog({
      type: 'inputChange',
      elementLabel: label,
      elementType: 'DIRECTIVE-MAT-SELECT',
      value: selectedValue,
    });
  }
}

// ----------------------------

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'button, a',
  standalone: true,
  host: {
    '(click)': 'onClick($event)',
  },
})
export class EventButtonDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  onClick(event: MouseEvent) {
    const inputTarget = event.target as HTMLElement;

    // mat-button is represented as 'span'
    const usedTarget = inputTarget.tagName === 'SPAN' ? inputTarget.parentElement : inputTarget;

    this.userEventTrackerService.createLog({
      type: 'clickElement',
      elementType: `DIRECTIVE-${usedTarget?.tagName ?? ''}`,
      value: usedTarget?.dataset['label'] || usedTarget?.innerText || 'Unknown',
    });
  }
}

// ----------------------------

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mat-radio-group',
  standalone: true,
  host: {
    '(change)': 'onChange($event)',
  },
})
export class EventButtonRadioDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  onChange(event: MatRadioChange) {
    const value = event.value;
    const nativeEL = event.source._inputElement.nativeElement;
    const label = nativeEL.parentElement?.parentElement?.parentElement?.parentElement?.dataset['label'];

    this.userEventTrackerService.createLog({
      type: 'inputChange',
      elementType: 'DIRECTIVE-MAT-RADIO',
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
  host: {
    '(change)': 'onChange($event)',
  },
})
export class EventCheckboxDirective {
  private readonly userEventTrackerService = inject(UserEventTrackerService);

  onChange(event: MatCheckboxChange) {
    const value = event.checked;
    const label = event.source._elementRef.nativeElement.dataset['label'] ?? 'Unknown';

    this.userEventTrackerService.createLog({
      type: 'inputChange',
      elementType: 'DIRECTIVE-MAT-CHECKBOX',
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
