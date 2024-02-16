import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TodoService } from './todo.service';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatButtonModule]
})
export class AddTodoComponent {

  addTodoForm = new FormGroup({
    // We allow alphanumeric input and limit the length for owner.
    owner: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      // In the real world you'd want to be very careful about having
      // an upper limit like this because people can sometimes have
      // very long owners. This demonstrates that it's possible, though,
      // to have maximum length limits.
      Validators.maxLength(50),
      (fc) => {
        if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
          return ({ existingOwner: true });
        } else {
          return null;
        }
      },
    ])),

    // Since this is for a company, we need workers to be old enough to work, and probably not older than 200.
    category: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      // In the real world you'd want to be very careful about having
      // an upper limit like this because people can sometimes have
      // very long owners. This demonstrates that it's possible, though,
      // to have maximum length limits.
      Validators.maxLength(50),
      (fc) => {
        if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
          return ({ existingCategory: true });
        } else {
          return null;
        }
      },
    ])),
  // We don't care much about what is in the company field, so we just add it here as part of the form
  // without any particular validation.
    // We allow alphanumeric input and limit the length for owner.
    body: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      // In the real world you'd want to be very careful about having
      // an upper limit like this because people can sometimes have
      // very long owners. This demonstrates that it's possible, though,
      // to have maximum length limits.
      Validators.maxLength(50),
      (fc) => {
        if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
          return ({ existingBody: true });
        } else {
          return null;
        }
      },
    ])),

  status: new FormControl<boolean>(false, Validators.compose([
    Validators.required,
    Validators.pattern('^(False|True)$'),
  ])),
  });
  // We don't need a special validator just for our app here, but there is a default one for email.
  // We will require the email, though.
/*
  role: new FormControl<TodoStatus>('viewer', Validators.compose([
    Validators.required,
    Validators.pattern('^(admin|editor|viewer)$'),
    ])),
  });*/


  // We can only display one error at a time,
  // the order the messages are defined in is the order they will display in.
  readonly addTodoValidationMessages = {
  owner: [
    { type: 'required', message: 'Owner is required' },
    { type: 'minlength', message: 'Owner must be at least 2 characters long' },
    { type: 'maxlength', message: 'Owner cannot be more than 50 characters long' },
    { type: 'existingOwner', message: 'Owner has already been taken' }
  ],

  category: [
    { type: 'required', message: 'category is required' },
    { type: 'minlength', message: 'category must be at least 2 characters long' },
    { type: 'maxlength', message: 'category cannot be more than 50 characters long' },
    { type: 'existinCategory', message: 'category has already been taken' }
  ],

  body: [
    { type: 'required', message: 'body is required' },
    { type: 'minlength', message: 'body must be at least 2 characters long' },
    { type: 'maxlength', message: 'body cannot be more than 50 characters long' },
    { type: 'existingBody', message: 'body has already been taken' }
  ],
  status: [
    { type: 'required', message: 'Status is required' },
    { type: 'pattern', message: 'status must be False, True' },
  ]
};

constructor(
  private todoService: TodoService,
  private snackBar: MatSnackBar,
  private router: Router) {
}

formControlHasError(controlOwner: string): boolean {
  return this.addTodoForm.get(controlOwner).invalid &&
    (this.addTodoForm.get(controlOwner).dirty || this.addTodoForm.get(controlOwner).touched);
}

getErrorMessage(owner: keyof typeof this.addTodoValidationMessages): string {
  for (const { type, message } of this.addTodoValidationMessages[owner]) {
    if (this.addTodoForm.get(owner).hasError(type)) {
      return message;
    }
  }
  return 'Unknown error';
}

submitForm() {
  this.todoService.addTodo(this.addTodoForm.value).subscribe({
    next: (newOwner) => {
      this.snackBar.open(
        `Added todo ${this.addTodoForm.value.owner}`,
        null,
        { duration: 2000 }
      );
      this.router.navigate(['/todos/', newOwner]);
    },
    error: err => {
      this.snackBar.open(
        `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`,
        'OK',
        { duration: 5000 }
      );
    },
  });
}

}
