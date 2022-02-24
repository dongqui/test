/// <reference types="cypress" />

import { waitForModelNodeRendering, visitAndGetMockData, deleteNode, editNodeName, clickArrowIconOf, dataCy, getNodeName } from '../helper';

describe('LP Motion 테스트', () => {
  before(() => {
    visitAndGetMockData();
    waitForModelNodeRendering();
  });

  before(() => {
    cy.getByDataCy('lp-model').first().as('model').click('top');
    cy.get('@model').rightclick('top');
    cy.getByDataCy('contextmenu-add-empty-motion').click('top');
    clickArrowIconOf(cy.get('@model'));
  });

  it('모션 우클릭 후 edit name 클릭, 모션 이름 enter key로 수정', () => {
    const newName = 'editWithEnter';
    clickEmptyMotionOfFirstModel('motion-edit-enter');
    cy.get('@motion-edit-enter').rightclick();
    editNodeName(cy.get('@motion-edit-enter'), newName);
    cy.get('@input').type('{enter}');
    getNodeName(cy.get('@motion-edit-enter')).should('have.text', newName);
  });

  it('모션 우클릭 후 edit name 클릭, 모션 이름 빈 공간 클릭으로 수정', () => {
    const newName = 'editWithClick';
    clickEmptyMotionOfFirstModel('motion-edit-click');
    cy.get('@motion-edit-click').rightclick();
    editNodeName(cy.get('@motion-edit-click'), newName);
    cy.getByDataCy('lp-body').click();
    getNodeName(cy.get('@motion-edit-click')).should('have.text', newName);
  });

  it.skip('모션 우클릭 후 delete 클릭시 모션 삭제.', () => {
    // delete modal 추가??
    getMotionsOfFirstModel().should('have.length', 2);
    deleteNode(getLastMotionofFirstModel());
    getMotionsOfFirstModel().should('have.length', 1);
  });

  // TODO: motion 추출 flow, visualization, export
});

function clickEmptyMotionOfFirstModel(motionAlias: string) {
  cy.getByDataCy('lp-model').first().find(dataCy('lp-motion')).last().as(motionAlias).click();
}

function getMotionsOfFirstModel() {
  return cy.getByDataCy('lp-model').first().find(dataCy('lp-motion'));
}

function getLastMotionofFirstModel() {
  return cy.getByDataCy('lp-model').first().find(dataCy('lp-motion')).last();
}
