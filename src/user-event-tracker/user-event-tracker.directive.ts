import { Directive, HostListener, inject } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

/**
 * track form submission
 */
@Directive({
  selector: 'form[formGroup]',
  standalone: true,
})
export class FormSubmitDirective {
  private readonly formGroupDirective = inject(FormGroupDirective);

  @HostListener('ngSubmit', ['$event'])
  onSubmit(event: Event) {
    // prevent default browser submission
    event.preventDefault();

    const form = this.formGroupDirective.form;
    const isValid = form.valid;
    const values = form.getRawValue();

    console.log('Form Valid:', isValid);
    console.log('Form Values:', values);
  }
}
