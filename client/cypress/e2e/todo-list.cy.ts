/*import { TodoListPage } from '../support/todo-list.po';

const page = new TodoListPage();

describe('Todo list', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTodoTitle().should('have.text', 'Todos');
  });

  it('Should show 10 todos in both card and list view', () => {
    page.getTodoCards().should('have.length', 10);
    page.changeView('list');
    page.getTodoListItems().should('have.length', 10);
  });

  it('Should type something in the owner filter and check that it returned correct elements', () => {
    // Filter for todo 'Lynn Ferguson'
    cy.get('[data-test=todoOwnerInput]').type('Lynn Ferguson');

    // All of the todo cards should have the owner we are filtering by
    page.getTodoCards().each(e => {
      cy.wrap(e).find('.todo-card-owner').should('have.text', 'Lynn Ferguson');
    });

    // (We check this two ways to show multiple ways to check this)
    page.getTodoCards().find('.todo-card-owner').each(el =>
      expect(el.text()).to.equal('Lynn Ferguson')
    );
  });

  it('Should type something in the category filter and check that it returned correct elements', () => {
    // Filter for category 'OHMNET'
    cy.get('[data-test=todoCategoryInput]').type('OHMNET');

    page.getTodoCards().should('have.lengthOf.above', 0);

    // All of the todo cards should have the category we are filtering by
    page.getTodoCards().find('.todo-card-category').each(card => {
      cy.wrap(card).should('have.text', 'OHMNET');
    });
  });

  it('Should type something partial in the category filter and check that it returned correct elements', () => {
    // Filter for companies that contain 'ti'
    cy.get('[data-test=todoCategoryInput]').type('ti');

    page.getTodoCards().should('have.lengthOf', 2);

    // Each todo card's category owner should include the text we are filtering by
    page.getTodoCards().each(e => {
      cy.wrap(e).find('.todo-card-category').should('include.text', 'TI');
    });
  });

    // Filter for todos of age '27'

    page.getTodoCards().should('have.lengthOf', 3);

    // Go through each of the cards that are being shown and get the owners
    page.getTodoCards().find('.todo-card-owner')
      // We should see these todos whose age is 27
      .should('contain.text', 'Stokes Clayton')
      .should('contain.text', 'Bolton Monroe')
      .should('contain.text', 'Merrill Parker')
      // We shouldn't see these todos
      .should('not.contain.text', 'Connie Stewart')
      .should('not.contain.text', 'Lynn Ferguson');
  });

  it('Should change the view', () => {
    // Choose the view type "List"
    page.changeView('list');

    // We should not see any cards
    // There should be list items
    page.getTodoCards().should('not.exist');
    page.getTodoListItems().should('exist');

    // Choose the view type "Card"
    page.changeView('card');

    // There should be cards
    // We should not see any list items
    page.getTodoCards().should('exist');
    page.getTodoListItems().should('not.exist');
  });

  it('Should select a status, switch the view, and check that it returned correct elements', () => {
    // Filter for status true);
    page.selectStatus(true);

    // Choose the view type "List"
    page.changeView('list');

    // Some of the todos should be listed
    page.getTodoListItems().should('have.lengthOf.above', 0);

    // All of the todo list items that show should have the status we are looking for
    page.getTodoListItems().each(el => {
      cy.wrap(el).find('.todo-list-status').should('contain', true);
    });
  });

  it('Should click view profile on a todo and go to the right URL', () => {
    page.getTodoCards().first().then((card) => {
      const firstTodoOwner = card.find('.todo-card-owner').text();
      const firstTodoCategory = card.find('.todo-card-category').text();

      // When the view profile button on the first todo card is clicked, the URL should have a valid mongo ID
      page.clickViewProfile(page.getTodoCards().first());

      // The URL should be '/todos/' followed by a mongo ID
      cy.url().should('match', /\/todos\/[0-9a-fA-F]{24}$/);

      // On this profile page we were sent to, the owner and category should be correct
      cy.get('.todo-card-owner').first().should('have.text', firstTodoOwner);
      cy.get('.todo-card-category').first().should('have.text', firstTodoCategory);
    });
   });

  it('Should click add todo and go to the right URL', () => {
    // Click on the button for adding a new todo
    page.addTodoButton().click();

    // The URL should end with '/todos/new'
    cy.url().should(url => expect(url.endsWith('/todos/new')).to.be.true);

    // On the page we were sent to, We should see the right title
    cy.get('.add-todo-title').should('have.text', 'New Todo');
  });
*/
