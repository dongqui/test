/// <reference types="cypress" />

import { waitForModelNodeRendering, pasteFolderOn, copyOf, visitAndGetMockData } from '../helper';

describe('LP Body 테스트', () => {
  before(() => {
    visitAndGetMockData();
    waitForModelNodeRendering();
  });

  it('우클릭시에 ContextMenu가 보여집니다.', () => {
    openContextMenu();
    cy.getByDataCyLike('contextmenu').should('exist');
    cy.getByDataCy('lp-body').click();
  });

  it('우클릭 후 폴더를 생성합니다.', () => {
    cy.getByDataCy('lp-folder').should('have.length', 0);
    openContextMenu();
    cy.getByDataCy('contextmenu-new-directory').click();
    cy.getByDataCy('lp-folder').should('have.length', 1);
  });

  it('폴더 생성시에 중복되는 폴더명을 처리합니다.', () => {
    openContextMenu();
    cy.getByDataCy('contextmenu-new-directory').click();
    openContextMenu();
    cy.getByDataCy('contextmenu-new-directory').click();
    openContextMenu();
    cy.getByDataCy('contextmenu-new-directory').click();

    cy.getByDataCy('lp-folder').eq(0).should('have.text', 'Untitled');
    cy.getByDataCy('lp-folder').eq(1).should('have.text', 'Untitled (2)');
    cy.getByDataCy('lp-folder').eq(2).should('have.text', 'Untitled (3)');
  });

  it('우클릭 후 Select all 클릭시 모두 선택합니다', () => {
    openContextMenu();
    cy.getByClassLike('ListNode_selected').should('have.length', 0);
    cy.getByDataCy('contextmenu-select-all').click();

    // 임시로 가져오는 모델 수에 따라 결과 달라질 수 있음
    cy.getByClassLike('ListNode_selected').should('have.length', 8);
    cy.getByDataCy('lp-body').click();
  });

  it.skip('copy & paste folder on root', () => {
    copyOf(cy.getByDataCy('lp-folder').first());
    pasteFolderOn(cy.getByDataCy('lp-body'));
  });
  // TODO: Unselect all
});

function openContextMenu() {
  cy.getByDataCy('lp-body').rightclick();
}
