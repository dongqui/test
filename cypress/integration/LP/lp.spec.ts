/// <reference types="cypress" />

import { skipOn } from '@cypress/skip-test';

import {
  waitForModelNodeRendering,
  visitAndGetMockData,
  deleteNode,
  createFolder,
  editNodeName,
  pasteFolderOn,
  copyOf,
  clickArrowIconOf,
  dataCy,
  DEFAULT_FOLDER_NAME,
  getNodeName,
  modelVisualization,
  compareRPSnapshot,
  clickEmptyMotionOfFirstModel,
  getMotionsOfFirstModel,
  getLastMotionofFirstModel,
  handleOnboarding,
} from '../helper';

describe('LP test', () => {
  before(() => {
    visitAndGetMockData();
    waitForModelNodeRendering();
    handleOnboarding();
  });

  context('LP Body test', () => {
    it('우클릭시에 ContextMenu가 보여집니다.', () => {
      cy.getByDataCy('lp-body').rightclick();
      cy.getByDataCyLike('contextmenu').should('exist');
      cy.getByDataCy('lp-body').click();
    });

    it('우클릭 후 폴더를 생성합니다.', () => {
      cy.getByDataCy('lp-folder').should('have.length', 0);
      cy.getByDataCy('lp-body').rightclick();
      cy.getByDataCy('contextmenu-new-directory').click();
      cy.getByDataCy('lp-folder').as('folder_0').should('have.length', 1);
      deleteNode(cy.get('@folder_0'));
    });

    it('폴더 생성시에 중복되는 폴더명을 처리합니다.', () => {
      createFolder();
      createFolder();
      createFolder();

      cy.getByDataCy('lp-folder').eq(0).as('folder_1').should('have.text', 'Untitled');
      cy.getByDataCy('lp-folder').eq(1).as('folder_2').should('have.text', 'Untitled (2)');
      cy.getByDataCy('lp-folder').eq(2).as('folder_3').should('have.text', 'Untitled (3)');
    });

    it.skip('우클릭 후 Select all 클릭시 모두 선택합니다', () => {
      cy.getByDataCy('lp-body').rightclick();
      cy.getByClassLike('ListNode_selected').should('have.length', 0);
      cy.getByDataCy('contextmenu-select-all').click();

      cy.getByClassLike('ListNode_selected').should('have.length', 8);
      cy.getByDataCy('lp-body').click();
    });

    it.skip('copy & paste folder on root', () => {
      copyOf(cy.getByDataCy('lp-folder').first());
      pasteFolderOn(cy.getByDataCy('lp-body'));
    });

    after(() => {
      deleteNode(cy.get('@folder_1'));
      deleteNode(cy.get('@folder_2'));
      deleteNode(cy.get('@folder_3'));
    });
  });

  context('LP Folder test', () => {
    beforeEach(() => {
      createFolder();
    });

    afterEach(() => {
      deleteNode(cy.getByDataCy('lp-folder').first());
    });

    it('delete 클릭시에 폴더 삭제', () => {
      createFolder();
      cy.getByDataCy('lp-folder')
        .its('length')
        .then((folderCount) => {
          deleteNode(cy.getByDataCy('lp-folder').first());
          cy.getByDataCy('lp-folder').should('have.length', folderCount - 1);
        });
    });

    it('edit name 클릭 후 폴더 이름 enter key로 수정', () => {
      const newName = 'editWithEnter';
      cy.getByDataCy('lp-folder').last().as('folder_edit_enter');
      editNodeName(cy.get('@folder_edit_enter'), newName);
      cy.get('@input').type('{enter}');
      cy.get('@folder_edit_enter').should('have.text', newName);
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

      clickArrowIconOf(cy.get('@folder_copy_paste'));
      cy.get('@folder_copy_paste').find(dataCy('lp-folder')).should('have.text', `${DEFAULT_FOLDER_NAME} copy`);
    });

    it('폴더 안에 새로운 폴더 생성', () => {
      cy.getByDataCy('lp-folder').last().as('folder_new_folder');

      createFolder(cy.get('@folder_new_folder'));

      clickArrowIconOf(cy.get('@folder_new_folder'));

      cy.get('@folder_new_folder').find(dataCy('lp-folder')).as('new_folder');
      cy.get('@new_folder').should('have.text', DEFAULT_FOLDER_NAME);
    });

    it('2 depth 폴더 안에 새로운 폴더 생성', () => {
      cy.getByDataCy('lp-folder').last().as('folder_new_folder_depth');
      createFolder(cy.get('@folder_new_folder_depth'));
      clickArrowIconOf(cy.get('@folder_new_folder_depth'));
      cy.getByDataCy('lp-folder').last().as('new_folder_2');

      cy.getByDataCy('lp-folder').last().as('new_folder_2');

      createFolder(cy.get('@new_folder_2'));
      clickArrowIconOf(cy.get('@new_folder_2'));
      cy.getByDataCy('lp-folder').last().as('new_folder_3');
      clickArrowIconOf(cy.get('@new_folder_3'));

      cy.get('@folder_new_folder_depth').find(dataCy('lp-folder')).should('have.length', 2);
      cy.get('@new_folder_2').find(dataCy('lp-folder')).should('have.length', 1);
    });

    it('폴더 안에 폴더를 Drag and Drop', () => {
      createFolder();
      const dataTransfer = new DataTransfer();
      cy.getByDataCy('lp-folder').last().trigger('dragstart', { dataTransfer });
      cy.getByDataCy('lp-folder').first().as('folder_drag&drop').trigger('drop', { dataTransfer });
      clickArrowIconOf(cy.get('@folder_drag&drop'));
      cy.get('@folder_drag&drop').find(dataCy('lp-folder')).should('have.length', 1);
    });
  });

  context('LP Model test', () => {
    context('Model management test', () => {
      it('model 삭제', () => {
        cy.getByDataCy('lp-model')
          .its('length')
          .then((modelCount) => {
            deleteNode(cy.getByDataCy('lp-model').last());
            cy.getByDataCy('lp-model').should('have.length', modelCount - 1);
          });
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
        cy.get('@model_name_edit_click').should('have.text', `${newName}.glb`);
      });

      it.skip('copy & paste', () => {
        cy.getByDataCy('lp-model').last().as('model_copy_paste');
        cy.get('@model_copy_paste')
          .invoke('text')
          .then((text) => {
            copyOf(cy.get('@model_copy_paste'));
            pasteFolderOn(cy.getByDataCy('lp-body'));

            cy.getByDataCy('lp-model')
              .last()
              .should('have.text', `${text.replace('.glb', '')} copy (2).glb`);
          });
      });
    });

    context('Visualization test', () => {
      // 2021.12.09 Knight.glb 이미지 스냅샷으로 test 중

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
      before(() => {
        modelVisualization(cy.getByDataCy('lp-model').first());
      });

      it('Export glb', () => {
        cy.getByDataCy('lp-model').first().as('model_export_glb');
        cy.get('@model_export_glb').rightclick('top');
        cy.getByDataCy('contextmenu-export').click('top');

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

  context('LP Motion test', () => {
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
      cy.get('@motion-edit-enter').should('have.text', newName);
    });

    it('모션 우클릭 후 edit name 클릭, 모션 이름 빈 공간 클릭으로 수정', () => {
      const newName = 'editWithClick';
      clickEmptyMotionOfFirstModel('motion-edit-click');
      cy.get('@motion-edit-click').rightclick();
      editNodeName(cy.get('@motion-edit-click'), newName);
      cy.getByDataCy('lp-body').click();
      cy.get('@motion-edit-click').should('have.text', newName);
    });

    it('모션 우클릭 후 delete 클릭시 모션 삭제.', () => {
      getMotionsOfFirstModel()
        .its('length')
        .then((motionCount) => {
          deleteNode(getLastMotionofFirstModel());
          getMotionsOfFirstModel().should('have.length', motionCount - 1);
        });
    });
  });

  describe('Mocap test', () => {});
});
