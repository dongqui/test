/// <reference types="cypress" />

import {
  visitAndGetMockData,
  modelVisualization,
  clickArrowIconOf,
  compareRPSnapshot,
  dragScrubber,
  clickRetargetingFirstBone,
  toggleFKController,
  waitForModelNodeRendering,
} from '../helper';
import { skipOn } from '@cypress/skip-test';
describe('RP 테스트', () => {
  before(() => {
    visitAndGetMockData();

    cy.getByDataCy('lp-model', { timeout: 10000 }).contains('DyingYup.glb').as('model');
    modelVisualization(cy.get('@model'));
  });
  context('screen visibility', () => {
    skipOn('headed', () => {
      it('Bone 클릭시에 Bone 숨김/보임', () => {
        cy.getByDataCy('ScreenVisibility-toggle').click();
        triggerScreenVisibility('bone');
        compareRPSnapshot();
        triggerScreenVisibility('bone');
      });

      it('Mesh 클릭시에 Mesh 숨김/보임', () => {
        triggerScreenVisibility('mesh');
        compareRPSnapshot();
        triggerScreenVisibility('mesh');
      });

      it('Controller 클릭시에 Controller 숨김/보임', () => {
        toggleFKController();
        cy.getByDataCy('ScreenVisibility-toggle').click();
        triggerScreenVisibility('controller');
        compareRPSnapshot();
        triggerScreenVisibility('controller');
      });

      it('Gizmo 클릭시에 Gizmo 숨김/보임', () => {
        clickRetargetingFirstBone();
        cy.getByDataCy('ScreenVisibility-toggle').click();
        triggerScreenVisibility('gizmo');
        cy.wait(1000); // gizmo 렌더링 타이밍이...!?
        compareRPSnapshot();
        triggerScreenVisibility('gizmo');
      });
    });
  });

  context('contextmenu', () => {
    it('select all 클릭시에 모든 Bone 선택', () => {
      triggerRPContextmenu('contextmenu-select-all');
      clickArrowIconOf(cy.getByDataCy('layer').first());

      cy.getByDataCy('bone-track-item').its('length').should('be.gt', 1);
    });

    it('unselect all 클릭시에 bone 선택 해제', () => {
      triggerRPContextmenu('contextmenu-unselect-all');
      cy.getByDataCy('bone-track-item').should('not.exist');
    });

    skipOn('headed', () => {
      it('view - front 클릭시에 모델 정면 보여주기', () => {
        triggerRPSubContextmenu('contextmenu-view', 'contextmenu-view-front');
        compareRPSnapshot();
      });

      it('view - back 클릭시에 모델 뒷면 보여주기', () => {
        triggerRPSubContextmenu('contextmenu-view', 'contextmenu-view-back');
        compareRPSnapshot();
      });

      it('view - top 클릭시에 모델 윗면 보여주기', () => {
        triggerRPSubContextmenu('contextmenu-view', 'contextmenu-view-top');
        compareRPSnapshot();
      });

      it('view - bottom 클릭시에 모델 아랫면 보여주기', () => {
        triggerRPSubContextmenu('contextmenu-view', 'contextmenu-view-bottom');
        compareRPSnapshot();
      });

      it('view - right 클릭시에 모델 오른쪽면 보여주기', () => {
        triggerRPSubContextmenu('contextmenu-view', 'contextmenu-view-right');
        compareRPSnapshot();
      });

      it('view - left 클릭시에 모델 왼쪽면 보여주기', () => {
        triggerRPSubContextmenu('contextmenu-view', 'contextmenu-view-left');
        compareRPSnapshot();
      });

      it('view - perspective 클릭시에 모델 기본 view 보여주기', () => {
        triggerRPSubContextmenu('contextmenu-view', 'contextmenu-view-perspective');
        compareRPSnapshot();
      });

      it('transform - rotation 클릭시에 rotation 조절 UI 표시', () => {
        clickRetargetingFirstBone();
        triggerRPSubContextmenu('contextmenu-transform', 'contextmenu-transform-rotation');
        compareRPSnapshot();
      });

      it('transform - scale 클릭시에 scale 조절 UI 표시', () => {
        clickRetargetingFirstBone();
        triggerRPSubContextmenu('contextmenu-transform', 'contextmenu-transform-scale');
        compareRPSnapshot();
      });

      it('transform - position 클릭시에 position 조절 UI 표시', () => {
        clickRetargetingFirstBone();
        triggerRPSubContextmenu('contextmenu-transform', 'contextmenu-transform-position');
        compareRPSnapshot();
      });

      it('camera reset 클릭시에 카메라 초기화', () => {
        cy.get('canvas').click('top', { force: true });
        RPCemaraZoomOut();
        triggerRPContextmenu('contextmenu-camera-reset');
        compareRPSnapshot();
      });
    });

    it('Insert keyframe', () => {
      cy.getByDataCy('lp-model').eq(2).as('model').rightclick();
      cy.getByDataCy('contextmenu-visualization').click();
      triggerRPContextmenu('contextmenu-select-all');

      cy.getByDataCy('keyframe')
        .its('length')
        .then((keyframeLength) => {
          cy.get('#scrubber').then(($scrubber) => {
            const { top, left } = $scrubber[0].getBoundingClientRect();
            dragScrubber(top, left, 300);
            triggerRPContextmenu('contextmenu-insert-keyframe');
            cy.getByDataCy('keyframe').should('have.length', keyframeLength + 1);
          });
        });
    });
  });
});

type ScreenVisibilityValue = 'bone' | 'mesh' | 'controller' | 'gizmo';
function triggerScreenVisibility(value: ScreenVisibilityValue) {
  cy.getByDataCy(`ScreenVisibility-${value}`).click();
}

function triggerRPContextmenu(contextmenuName: string) {
  cy.get('canvas').rightclick('top');
  cy.getByDataCy(contextmenuName).click();
}

function triggerRPSubContextmenu(menuName: string, submenuName: string) {
  cy.get('canvas').rightclick('top');
  // mousemove 사용...??
  cy.getByDataCy(menuName).trigger('mousemove');
  cy.getByDataCy(submenuName).click();
}

function RPCemaraZoomOut() {
  cy.get('canvas').then(($el) => {
    $el[0].dispatchEvent(new WheelEvent('wheel', { deltaY: 1000, deltaX: 0 }));
  });
}
