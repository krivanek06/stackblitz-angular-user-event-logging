import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';

type ValidationState =
  | 'VALID'
  | 'INVALID'
  | { [key: string]: ValidationState }
  | ValidationState[];

/**
 * Get the validation state of a form control
 * @returns the form object where each key is the control name and the value is the validation state - 'VALID' or 'INVALID'
 */
export const getFormValidationState = (form: AbstractControl): ValidationState => {
  if (form instanceof FormControl) {
    return form.valid ? 'VALID' : 'INVALID';
  }

  if (form instanceof FormGroup) {
    return Object.keys(form.controls).reduce(
      (acc, key) => ({
        ...acc,
        [key]: getFormValidationState(form.controls[key]),
      }),
      {},
    );
  }

  if (form instanceof FormArray) {
    return form.controls.map((control) => getFormValidationState(control));
  }

  // default use case, shouldn't happen
  return 'INVALID';
};
