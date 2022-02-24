// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.Commands.add('getByDataCy', (dataCyAttribute, options) => {
  return cy.get(`[data-cy=${dataCyAttribute}]`, options);
});

Cypress.Commands.add('getByDataCyLike', (dataCyAttribute) => {
  return cy.get(`[data-cy*=${dataCyAttribute}]`);
});

Cypress.Commands.add('getByClassLike', (className) => {
  return cy.get(`[class*="${className}"]`);
});

Cypress.Commands.add('getStoreState', (state?: string) => {
  return state ? cy.window().its('store').invoke('getState').its(state) : cy.window().its('store').invoke('getState');
});
