import {Todo} from 'src/app/todos/todo';

export class AddTodoPage {

  private readonly url = '/todos/new';
  private readonly title = '.add-todo-title';
  private readonly button = '[data-test=confirmAddTodoButton]';
  private readonly snackBar = '.mat-mdc-simple-snack-bar';
  private readonly ownerFieldOwner = 'owner';
  private readonly ageFieldOwner = 'age';
  private readonly categoryFieldOwner = 'category';
  private readonly bodyFieldOwner = 'body';
  private readonly formFieldSelector = `mat-form-field`;
  private readonly dropDownSelector = `mat-option`;

  navigateTo() {
    return cy.visit(this.url);
  }

  getTitle() {
    return cy.get(this.title);
  }

  addTodoButton() {
    return cy.get(this.button);
  }

  selectMatSelectValue(select: Cypress.Chainable, value: string) {
    // Find and click the drop down
    return select.click()
      // Select and click the desired value from the resulting menu
      .get(`${this.dropDownSelector}[value="${value}"]`).click();
  }

  getFormField(fieldOwner: string) {
    return cy.get(`${this.formFieldSelector} [formcontrolowner=${fieldOwner}]`);
  }

  getSnackBar() {
    return cy.get(this.snackBar);
  }

  addTodo(newTodo: Todo) {
    this.getFormField(this.ownerFieldOwner).type(newTodo.owner);
    if (newTodo.category) {
      this.getFormField(this.categoryFieldOwner).type(newTodo.category);
    }
    if (newTodo.body) {
      this.getFormField(this.bodyFieldOwner).type(newTodo.body);
    }
    this.selectMatSelectValue(this.getFormField('status'), String(newTodo.status));
    return this.addTodoButton().click();
  }
}
