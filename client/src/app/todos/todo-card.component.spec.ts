import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TodoCardComponent } from './todo-card.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';

describe('TodoCardComponent', () => {
  let component: TodoCardComponent;
  let fixture: ComponentFixture<TodoCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        BrowserAnimationsModule,
        MatCardModule,
        TodoCardComponent
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoCardComponent);
    component = fixture.componentInstance;
    component.todo = {
      _id: 'chris_id',
      owner: 'Chris',
      category: 'UMM',
      body: 'chris@this.that',
      status: true,    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
