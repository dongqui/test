/// <reference types="cypress" />
import { skipOn } from '@cypress/skip-test';
import {
  getNodeName,
  visitAndGetMockData,
  deleteNode,
  editNodeName,
  copyOf,
  pasteFolderOn,
  dataCy,
  clickArrowIconOf,
  modelVisualization,
  DEFAULT_TEST_MODEL_COUNT,
  waitForModelNodeRendering,
  compareRPSnapshot,
} from '../helper';

describe('LP Model 테스트', () => {
  before(() => {
    visitAndGetMockData();
    waitForModelNodeRendering();
  });

  context('Model management 테스트', () => {
    it('model 삭제', () => {
      cy.getByDataCy('lp-model').should('have.length', DEFAULT_TEST_MODEL_COUNT);
      deleteNode(cy.getByDataCy('lp-model').last());
      cy.getByDataCy('lp-model').should('have.length', DEFAULT_TEST_MODEL_COUNT - 1);
    });

    it('엔터로 모델 이름 수정', () => {
      const newName = 'editWithEnter';
      cy.getByDataCy('lp-model').last().as('model_name_edit_enter');
      editNodeName(cy.get('@model_name_edit_enter'), newName);
      cy.get('@input').type('{enter}');
      cy.get('@model_name_edit_enter').should('have.text', `${newName}.glb`);
    });

    it('클릭으로 모델 이름 수정', () => {
      const newName = 'editWithClick';
      cy.getByDataCy('lp-model').last().as('model_name_edit_click');
      editNodeName(cy.get('@model_name_edit_click'), newName);
      cy.getByDataCy('lp-body').click();
      getNodeName(cy.get('@model_name_edit_click')).should('have.text', `${newName}.glb`);
    });

    it.skip('copy & paste', () => {
      cy.getByDataCy('lp-model').last().as('model_copy_paste');
      cy.get('@model_copy_paste')
        .invoke('text')
        .then((text) => {
          copyOf(cy.get('@model_copy_paste'));
          pasteFolderOn(cy.getByDataCy('lp-body'));

          getNodeName(cy.getByDataCy('lp-model').last()).should('have.text', `${text.replace('.glb', '')} copy (2).glb`);
        });
    });
  });

  context('Visualization test', () => {
    // 2021.12.09 Knight.glb 이미지 스냅샷으로 테스트 중

    skipOn('headed', () => {
      it('visualization', () => {
        modelVisualization(cy.getByDataCy('lp-model').first());
        compareRPSnapshot();
      });

      it('visualization 해제', () => {
        cy.getByDataCy('lp-model').first().as('model_visualization_cancel');
        cy.get('@model_visualization_cancel').rightclick('top');
        cy.getByDataCy('contextmenu-visualization-cancel').click('top');
        compareRPSnapshot();
      });
    });
  });

  it('empty motion 추가', () => {
    cy.getByDataCy('lp-model').first().as('model_empty_motion');
    cy.get('@model_empty_motion').rightclick('top');
    cy.getByDataCy('contextmenu-add-empty-motion').click('top');
    clickArrowIconOf(cy.get('@model_empty_motion'));
    cy.get('@model_empty_motion').find(dataCy('lp-motion')).last().should('have.text', 'empty motion');
  });

  context.skip('Export test', () => {
    it('Export glb', () => {
      cy.getByDataCy('lp-model').first().as('model_export_glb');
      cy.get('@model_export_glb').rightclick('top');
      cy.getByDataCy('contextmenu-export-glb').click('top');

      cy.get('@model_export_glb')
        .invoke('text')
        .then((modelName) => {
          const downloadsFolder = Cypress.config('downloadsFolder');
          cy.task('existsSync', `${downloadsFolder}/${modelName}`).then((isFileExist) => {
            expect(isFileExist).to.be.true;
          });
        });
    });

    it('Export fbx', () => {
      cy.getByDataCy('lp-model').first().as('model_export_fbx');
      cy.get('@model_export_fbx').rightclick('top');
      cy.getByDataCy('contextmenu-export-fbx').click('top');
      cy.getByDataCy('modal').should('exist');

      // TODO: file 받아졌는지 확인, intercept post 500 error 왜...!!
    });
  });
});
