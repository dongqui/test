// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

export {};

import 'cypress-plugin-snapshots/commands';
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      getByDataCy(value: string, options?: any): Chainable<JQuery<HTMLElement>>;
      getByDataCyLike(value: string): Chainable<JQuery<HTMLElement>>;
      getByClassLike(value: string): Chainable<JQuery<HTMLElement>>;
      toMatchImageSnapshot(config: any): Chainable<JQuery<HTMLElement>>;
      getStoreState(state?: string): Chainable<any>;
    }
  }
}
