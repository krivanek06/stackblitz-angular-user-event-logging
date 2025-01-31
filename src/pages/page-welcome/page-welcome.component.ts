import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { FormSubmitDirective } from '../../user-event-tracker';

@Component({
  selector: 'app-page-welcome',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatButtonModule,
    FormSubmitDirective,
  ],
  styles: [
    `
      :host {
        display: block;
        width: 80%;
        margin: 0 auto;
      }

      mat-form-field {
        width: 100%;
      }
    `,
  ],
  standalone: true,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid gap-4">
      <!-- email -->
      <mat-form-field>
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" />
      </mat-form-field>

      <!-- password -->
      <mat-form-field>
        <mat-label>Password</mat-label>
        <input matInput formControlName="password" />
      </mat-form-field>

      <!-- character -->
      <div formGroupName="character" class="border p-4">
        <h2>Character</h2>

        <mat-form-field>
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" />
        </mat-form-field>

        <mat-form-field>
          <mat-label>Gender</mat-label>
          <input matInput formControlName="gender" />
        </mat-form-field>
      </div>

      <!-- initialItems -->
      <div formArrayName="initialItems" class="border p-4">
        <h2>Initial Items</h2>
        @for (item of form.controls.initialItems.controls; track $index; let i = $index) {
          <div [formGroupName]="i" class="flex gap-6">
            <mat-form-field>
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Quantity</mat-label>
              <input matInput formControlName="quantity" />
            </mat-form-field>
          </div>
        }
      </div>

      <button mat-stroked-button type="submit">Submit</button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageWelcomeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly form = this.fb.nonNullable.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.min(8)]),
    character: this.fb.nonNullable.group({
      username: this.fb.nonNullable.control('', [Validators.required, Validators.min(4)]),
      gender: this.fb.nonNullable.control('', [Validators.required]),
    }),
    initialItems: this.fb.nonNullable.array([
      this.fb.nonNullable.group({
        name: this.fb.nonNullable.control('', [Validators.required]),
        quantity: this.fb.nonNullable.control('', [
          Validators.required,
          Validators.min(1),
        ]),
      }),
    ]),
  });

  onSubmit() {
    console.log('submitted in welcome');
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      return;
    }

    const url = 'https://jsonplaceholder.typicode.com/posts';
    this.http.post(url, this.form.value).subscribe((res) => {
      console.log('res', res);
      this.router.navigate(['/thank-you']);
    });
  }
}
