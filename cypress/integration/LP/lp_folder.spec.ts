/// <reference types="cypress" />

import {
  waitForModelNodeRendering,
  visitAndGetMockData,
  deleteNode,
  createFolder,
  isContextmenuExist,
  editNodeName,
  pasteFolderOn,
  copyOf,
  clickArrowIconOf,
  dataCy,
  DEFAULT_FOLDER_NAME,
} from '../helper';

describe('LP Folder 테스트', () => {
  before(() => {
    visitAndGetMockData();
    waitForModelNodeRendering();
  });

  context('Folder management 테스트', () => {
    beforeEach(() => {
      createFolder();
    });

    afterEach(() => {
      deleteNode(cy.getByDataCy('lp-folder').first());
    });

    it('폴더 우클릭시에 ContextMenu가 보여집니다.', () => {
      // 우클릭 selection 문제
      cy.getByDataCy('lp-folder').as('folder_contextmenu').click();
      cy.get('@folder_contextmenu').rightclick();
      isContextmenuExist();
    });

    it('delete 클릭시에 폴더 삭제', () => {
      createFolder();
      cy.getByDataCy('lp-folder').should('have.length', 2);
      deleteNode(cy.getByDataCy('lp-folder').first());
      cy.getByDataCy('lp-folder').should('have.length', 1);
    });

    it('edit name 클릭 후 폴더 이름 enter key로 수정', () => {
      const newName = 'editWithEnter';
      cy.getByDataCy('lp-folder').last().as('folder_edit_enter');
      editNodeName(cy.get('@folder_edit_enter'), newName);
      cy.get('@input').type('{enter}');
      cy.getByDataCy('lp-folder').should('have.text', newName);
    });

    it('edit name 클릭 후 폴더 이름 빈 공간 클릭으로 수정', () => {
      cy.getByDataCy('lp-folder').last().as('folder_edit_click');
      const newName = 'editWithClick';
      editNodeName(cy.get('@folder_edit_click'), newName);
      cy.getByDataCy('lp-body').click();
      cy.get('@folder_edit_click').should('have.text', newName);
    });

    it.skip('폴더 안에 폴더를 copy & paste', () => {
      cy.getByDataCy('lp-folder').last().as('folder_copy_paste');
      copyOf(cy.get('@folder_copy_paste'));
      pasteFolderOn(cy.get('@folder_copy_paste'));

      // 차후 아이콘 누르지 않아도 폴더가 열리게 수정될 수 있음.
      clickArrowIconOf(cy.get('@folder_copy_paste'));
      cy.get('@folder_copy_paste').find(dataCy('lp-folder')).should('have.text', `${DEFAULT_FOLDER_NAME} copy`);
    });

    it('폴더 안에 새로운 폴더 생성', () => {
      cy.getByDataCy('lp-folder').last().as('folder_new_folder');

      createFolder(cy.get('@folder_new_folder'));

      // 차후 아이콘 누르지 않아도 폴더가 열리게 수정될 수 있음.
      clickArrowIconOf(cy.get('@folder_new_folder'));

      cy.get('@folder_new_folder').find(dataCy('lp-folder')).as('new_folder');
      cy.get('@new_folder').should('have.text', DEFAULT_FOLDER_NAME);
    });

    it('2 depth 폴더 안에 새로운 폴더 생성', () => {
      cy.getByDataCy('lp-folder').last().as('folder_new_folder_depth');
      createFolder(cy.get('@folder_new_folder_depth'));
      // 차후 아이콘 누르지 않아도 폴더가 열리게 수정될 수 있음.
      clickArrowIconOf(cy.get('@folder_new_folder_depth'));
      cy.getByDataCy('lp-folder').last().as('new_folder_2');

      cy.getByDataCy('lp-folder').last().as('new_folder_2');

      createFolder(cy.get('@new_folder_2'));
      // 차후 아이콘 누르지 않아도 폴더가 열리게 수정될 수 있음.
      clickArrowIconOf(cy.get('@new_folder_2'));
      cy.getByDataCy('lp-folder').last().as('new_folder_3');
      // 차후 아이콘 누르지 않아도 폴더가 열리게 수정될 수 있음.
      clickArrowIconOf(cy.get('@new_folder_3'));

      cy.get('@folder_new_folder_depth').find(dataCy('lp-folder')).should('have.length', 2);
      cy.get('@new_folder_2').find(dataCy('lp-folder')).should('have.length', 1);
    });

    it('폴더 안에 폴더를 Drag and Drop', () => {
      createFolder();
      cy.getByDataCy('lp-folder').last().trigger('dragstart');
      cy.getByDataCy('lp-folder').first().as('folder_drag&drop').trigger('drop');
      clickArrowIconOf(cy.get('@folder_drag&drop'));
      cy.get('@folder_drag&drop').find(dataCy('lp-folder')).should('have.length', 1);
    });
  });
});
