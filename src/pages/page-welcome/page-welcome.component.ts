import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { UserEventTrackerModule } from '../../user-event-tracker';

@Component({
  selector: 'app-page-welcome',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    UserEventTrackerModule,
    MatDialogModule,
    MatRadioModule,
    MatCheckboxModule,
  ],
  styles: [
    `
      :host {
        display: block;
        max-width: 700px;
        margin: 0 auto;
      }

      mat-form-field {
        width: 100%;
      }
    `,
  ],
  standalone: true,
  template: `
    <h1 class="text-xl">Welcome Form</h1>

    <div>
      Link:
      <a href="#" (click)="$event.preventDefault()" data-label="link-to-reactive-label">reactive-forms</a>
      or open dialog
      <button mat-button data-label="open-dialog-label" (click)="openDialog()">open dialog</button>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid gap-4">
      <!-- email -->
      <mat-form-field>
        <mat-label>Email</mat-label>
        <input data-label="EmailLabel" matInput formControlName="email" />
      </mat-form-field>

      <!-- password -->
      <mat-form-field>
        <mat-label>Password</mat-label>
        <input data-label="PasswordLabel" matInput formControlName="password" />
      </mat-form-field>

      <!-- character -->
      <div formGroupName="character" class="border p-4">
        <h2>Character</h2>

        <mat-form-field>
          <mat-label>Username</mat-label>
          <input data-label="UsernameLabel" matInput formControlName="username" />
        </mat-form-field>

        <mat-form-field>
          <mat-label>Gender</mat-label>
          <mat-select formControlName="gender">
            <mat-option data-label="GenderLabel" value="man">Man</mat-option>
            <mat-option data-label="GenderLabel" value="woman">Woman</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- initialItems -->
      <div formArrayName="initialItems" class="border p-4">
        <h2>Initial Items</h2>
        @for (item of form.controls.initialItems.controls; track $index; let i = $index) {
          <div [formGroupName]="i" class="flex gap-6">
            <mat-form-field>
              <mat-label>Name</mat-label>
              <input data-label="ItemNameLabel" matInput formControlName="name" />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Quantity</mat-label>
              <input data-label="ItemQuantityLabel" matInput formControlName="quantity" />
            </mat-form-field>
          </div>
        }
      </div>

      <!-- example html elements -->
      <div class="border p-4">
        <h2>Example HTML elements</h2>
        <mat-radio-group formControlName="radioButtonField1" data-label="RadioLabel 1">
          <mat-radio-button value="1">Option 1</mat-radio-button>
          <mat-radio-button value="2">Option 2</mat-radio-button>
        </mat-radio-group>

        <mat-radio-group formControlName="radioButtonField2" data-label="RadioLabel 2">
          <mat-radio-button value="3">Option 3</mat-radio-button>
          <mat-radio-button value="4">Option 4</mat-radio-button>
        </mat-radio-group>

        <div>
          <mat-checkbox formControlName="checkboxField" data-label="CheckboxLabel">Check me!</mat-checkbox>
        </div>
      </div>

      <button data-label="SubmitButtonLabel" mat-stroked-button type="submit">Submit</button>
    </form>

    <!-- dialog template -->
    <ng-template #dialogTemplate>
      <mat-dialog-content>
        <h1>Dialog</h1>
        <p>Dialog content</p>
      </mat-dialog-content>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageWelcomeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);

  readonly dialogTemplate = viewChild<TemplateRef<HTMLElement>>('dialogTemplate');

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
        quantity: this.fb.nonNullable.control('', [Validators.required, Validators.min(1)]),
      }),
    ]),
    radioButtonField1: this.fb.nonNullable.control(''),
    radioButtonField2: this.fb.nonNullable.control(''),
    checkboxField: this.fb.nonNullable.control(false),
  });

  onSubmit() {
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      return;
    }

    const url = 'https://jsonplaceholder.typicode.com/posts';

    this.http.post(url, this.form.value).subscribe(() => {
      this.router.navigate(['/thank-you']);
    });
  }

  openDialog() {
    this.dialog.open(this.dialogTemplate()!);
  }
}
