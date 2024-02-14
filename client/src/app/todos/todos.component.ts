import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { TodoService } from './todo.service';
import { Todo } from './todo';
import { NgFor } from '@angular/common';


@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [NgFor],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.scss'
})
export class TodosComponent implements OnInit{
  todos: Todo[];

  constructor(private todoService: TodoService) {}

  ngOnInit() {
    this.todoService.getTodos().subscribe((todos) => {
      this.todos = todos;
    });
  }

}
