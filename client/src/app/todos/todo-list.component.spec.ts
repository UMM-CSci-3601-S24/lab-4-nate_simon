import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { MockTodoService } from '../../testing/todo.service.mock';
import { Todo } from './todo';
import { TodoCardComponent } from './todo-card.component';
import { TodoListComponent } from './todo-list.component';
import { TodoService } from './todo.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const COMMON_IMPORTS: unknown[] = [
  FormsModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatOptionModule,
  MatButtonModule,
  MatInputModule,
  MatExpansionModule,
  MatTooltipModule,
  MatListModule,
  MatDividerModule,
  MatRadioModule,
  MatIconModule,
  MatSnackBarModule,
  BrowserAnimationsModule,
  RouterTestingModule,
];

describe('Todo list', () => {

  let todoList: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [COMMON_IMPORTS, TodoListComponent, TodoCardComponent],
    // providers:    [ TodoService ]  // NO! Don't provide the real service!
    // Provide a test-double instead
    providers: [{ provide: TodoService, useValue: new MockTodoService() }]
});
  });

  // This constructs the `todoList` (declared
  // above) that will be used throughout the tests.
  beforeEach(waitForAsync(() => {
  // Compile all the components in the test bed
  // so that everything's ready to go.
    TestBed.compileComponents().then(() => {
      /* Create a fixture of the TodoListComponent. That
       * allows us to get an instance of the component
       * (todoList, below) that we can control in
       * the tests.
       */
      fixture = TestBed.createComponent(TodoListComponent);
      todoList = fixture.componentInstance;
      /* Tells Angular to sync the data bindings between
       * the model and the DOM. This ensures, e.g., that the
       * `todoList` component actually requests the list
       * of todos from the `MockTodoService` so that it's
       * up to date before we start running tests on it.
       */
      fixture.detectChanges();
    });
  }));

  it('contains all the todos', () => {
    expect(todoList.serverFilteredTodos.length).toBe(3);
  });

  it('contains a todo ownerd \'Chris\'', () => {
    expect(todoList.serverFilteredTodos.some((todo: Todo) => todo.owner === 'Chris')).toBe(true);
  });

  it('contain a todo ownerd \'Jamie\'', () => {
    expect(todoList.serverFilteredTodos.some((todo: Todo) => todo.owner === 'Jamie')).toBe(true);
  });

  it('doesn\'t contain a todo ownerd \'Santa\'', () => {
    expect(todoList.serverFilteredTodos.some((todo: Todo) => todo.owner === 'Santa')).toBe(false);
  });

});

/*
 * This test is a little odd, but illustrates how we can use stubs
 * to create mock objects (a service in this case) that be used for
 * testing. Here we set up the mock TodoService (todoServiceStub) so that
 * _always_ fails (throws an exception) when you request a set of todos.
 */
describe('Misbehaving Todo List', () => {
  let todoList: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;

  let todoServiceStub: {
    getTodos: () => Observable<Todo[]>;
  };

  beforeEach(() => {
    // stub TodoService for test purposes
    todoServiceStub = {
      getTodos: () => new Observable(observer => {
        observer.error('getTodos() Observer generates an error');
      }),
    };

    TestBed.configureTestingModule({
    imports: [COMMON_IMPORTS, TodoListComponent],
    // providers:    [ TodoService ]  // NO! Don't provide the real service!
    // Provide a test-double instead
    providers: [{ provide: TodoService, useValue: todoServiceStub }]
});
  });

  // Construct the `todoList` used for the testing in the `it` statement
  // below.
  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TodoListComponent);
      todoList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('generates an error if we don\'t set up a TodoListService', () => {
    const mockedMethod = spyOn(todoList, 'getTodosFromServer').and.callThrough();
    // Since calling either getTodos() or getTodosFiltered() return
    // Observables that then throw exceptions, we don't expect the component
    // to be able to get a list of todos, and serverFilteredTodos should
    // be undefined.
    expect(todoList.serverFilteredTodos)
      .withContext('service can\'t give values to the list if it\'s not there')
      .toBeUndefined();
    expect(todoList.getTodosFromServer)
      .withContext('will generate the right error if we try to getTodosFromServer')
      .toThrow();
    expect(mockedMethod)
      .withContext('will be called')
      .toHaveBeenCalled();
    expect(todoList.errMsg)
      .withContext('the error message will be')
      .toContain('Problem contacting the server – Error Code:');
      console.log(todoList.errMsg);
  });
});
