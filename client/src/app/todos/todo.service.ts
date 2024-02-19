import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Todo  } from './todo';

import { map } from 'rxjs/operators';



/**
 * Service that provides the interface for getting information
 * about `Users` from the server.
 */
@Injectable({
  providedIn: `root`
})
export class TodoService {
  // The URL for the users part of the server API.
  readonly todoUrl: string = `${environment.apiUrl}todos`;


  // private readonly roleKey = 'role';
  // private readonly ageKey = 'age';
  // private readonly companyKey = 'company';
     private readonly ownerKey = 'owner';
     private readonly CategoryKey = 'category';
     private readonly statusKey = 'status';


  // The private `HttpClient` is *injected* into the service
  // by the Angular framework. This allows the system to create
  // only one `HttpClient` and share that across all services
  // that need it, and it allows us to inject a mock version
  // of `HttpClient` in the unit tests so they don't have to
  // make "real" HTTP calls to a server that might not exist or
  // might not be currently running.
  constructor(private httpClient: HttpClient) {
  }

  /**
   * Get all the users from the server, filtered by the information
   * in the `filters` map.
   *
   * It would be more consistent with `UserListComponent` if this
   * only supported filtering on age and role, and left company to
   * just be in `filterUsers()` below. We've included it here, though,
   * to provide some additional examples.
   *
   * @param filters a map that allows us to specify a target role, age,
   *  or company to filter by, or any combination of those
   * @returns an `Observable` of an array of `Users`. Wrapping the array
   *  in an `Observable` means that other bits of of code can `subscribe` to
   *  the result (the `Observable`) and get the results that come back
   *  from the server after a possibly substprivate readonly ownerKey = 'owner';ntial delay (because we're
   *  contacting a remote server over the Internet).
   */
  getTodos(filters?: { owner?: string; status?: boolean; category?: string; body?: string;}): Observable<Todo[]> {
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.owner) {
        httpParams = httpParams.set(this.ownerKey, filters.owner);
      }
      if (filters.status !== undefined) {
        httpParams = httpParams.set('status', filters.status);
      }
      if (filters.category) {
        httpParams = httpParams.set(this.CategoryKey, filters.category);
      }
      if (filters.body) {
        httpParams = httpParams.set('body', filters.body);
      }
      // Add other filters as needed...
    }
    return this.httpClient.get<Todo[]>(this.todoUrl, {
      params: httpParams,
    });
  }
  /**
   * Get the `User` with the specified ID.
   *
   * @param id the ID of the desired user
   * @returns an `Observable` containing the resulting user.
   */
  getTodoById(id: string): Observable<Todo> {
    // The input to get could also be written as (this.userUrl + '/' + id)
    return this.httpClient.get<Todo>(`${this.todoUrl}/${id}`);
  }

  filterTodos(todos: Todo[], filters: { limit?: number; owner?: string; status?: boolean; category?: string; body?: string;}): Todo[] {
    let filteredTodos = todos;

    // Filter by owner
    // if (filters.owner) {
    //   filters.owner = filters.owner.toLowerCase();
    //   filteredTodos = filteredTodos.filter(todo => todo.owner.toLowerCase().indexOf(filters.owner) !== -1);
    // }


    // Filter by body
    if (filters.body) {
      filters.body = filters.body.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => todo.body.toLowerCase().indexOf(filters.body) !== -1);
    }

    //Filter by category
    if (filters.category) {
      filters.category = filters.category.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => todo.category.toLowerCase().indexOf(filters.category) !== -1);
    }

    //Filter by status
    if (filters.status !== undefined) {
      filteredTodos = filteredTodos.filter(todo => todo.status === filters.status);
    }

    // Filter by status
    // if (filters.status) {
    //   filters.status = filters.status.toLowerCase();
    //   filteredTodos = filteredTodos.filter(todo => todo.status.toLowerCase().indexOf(filters.status) !== -1);
    // }

    // Filter by limit
    if (filters.limit) {
      filteredTodos = filteredTodos.slice(0, filters.limit);
    }

    return filteredTodos;


  }

  addTodo(newTodo: Partial<Todo>): Observable<string> {
    // Send post request to add a new user with the user data as the body.
    return this.httpClient.post<{id: string}>(this.todoUrl, newTodo).pipe(map(res => res.id));
  }

}
