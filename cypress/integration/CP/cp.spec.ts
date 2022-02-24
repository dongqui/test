/// <reference types="cypress" />
import {
  visitAndGetMockData,
  modelVisualization,
  clickRetargetingFirstBone,
  waitForModelNodeRendering,
  compareRPSnapshot,
  clickCPTab,
  compareCPSkeltonSnapshot,
  RETARGET_SOURCE_COUNT,
  clickDropdown,
  clickConfirmOnModal,
} from '../helper';
import { skipOn } from '@cypress/skip-test';
import * as BABYLON from '@babylonjs/core';

describe('CP 테스트', () => {
  before(() => {
    visitAndGetMockData();
    waitForModelNodeRendering();
    modelVisualization(cy.getByDataCy('lp-model').first());
  });

  context('Retargeting', () => {
    before(() => {
      clickCPTab('retargeting');
    });

    skipOn('headed', () => {
      it('Render skeleton with bones', () => {
        compareCPSkeltonSnapshot();
      });
    });

    it('Source dropdown에 Retarget souce가 모두 있음 ', () => {
      clickDropdown('source');
      cy.getByDataCyLike('dropdown-item').should('have.length', RETARGET_SOURCE_COUNT);
      clickDropdown('source');
    });

    it('Target dropdown에 bone이 모두 있음 ', () => {
      clickDropdown('target');
      getVisualizedTransformNodesCount().then((targetLength) => {
        const NONE_MENU_COUNT = 1;
        cy.getByDataCyLike('dropdown-item').should('have.length', targetLength + NONE_MENU_COUNT);
        clickDropdown('target');
      });
    });

    it('수동으로 source와 target을 assign 할 수 있어야한다.', () => {
      const FIRST_SOURCE_INDEX = 0;
      clickDropdown('source');
      cy.getByDataCyLike('dropdown-item').first().click();
      clickDropdown('target');
      cy.getByDataCyLike('dropdown-item').eq(15).click();
      cy.getByDataCy('retarget-assign').click();
      clickConfirmOnModal();
      getVisualizedRetargetMap()
        .then((visualizedRetargetMap) => {
          const targetTransformNodeId = visualizedRetargetMap.values[FIRST_SOURCE_INDEX].targetTransformNodeId;
          return getTransformNodeById(targetTransformNodeId);
        })
        .then((targetTransformNode) => {
          cy.getByDataCy('dropdown-target').should('have.text', targetTransformNode.name);
          skipOn('headed', () => {
            compareRPSnapshot();
          });
        });
    });
  });

  context('Animation tab - Transform', () => {
    skipOn('headed', () => {
      it('Transform position 조작시 position 변경', () => {
        clickRetargetingFirstBone();
        clickCPTab('animation');
        typeValueOnAnimationInput('position', 'X', 100);
        typeValueOnAnimationInput('position', 'Y', 80);
        typeValueOnAnimationInput('position', 'Z', 50);
        compareRPSnapshot();
      });

      it('Transform euler 조작시 euler 변경', () => {
        clickRetargetingFirstBone();
        clickCPTab('animation');
        typeValueOnAnimationInput('euler', 'X', 3);
        typeValueOnAnimationInput('euler', 'Y', 5);
        typeValueOnAnimationInput('euler', 'Z', 5);
        compareRPSnapshot();
      });

      it('Transform scale 조작시 scale 변경', () => {
        clickRetargetingFirstBone();
        clickCPTab('animation');
        typeValueOnAnimationInput('scale', 'X', 2);
        typeValueOnAnimationInput('scale', 'Y', 2);
        typeValueOnAnimationInput('scale', 'Z', 2);
        compareRPSnapshot();
      });
    });
  });
});

type position = 'X' | 'Y' | 'Z';
function typeValueOnAnimationInput(inputTitle: string, position: position, value: number | string) {
  cy.getByDataCy(`AnimationInput-${inputTitle}-${position}`)
    .clear()
    .type(value + '')
    .type('{enter}');
}

function getVisualizedTransformNodesCount() {
  // utils에 있는 거 쓸 수 있는 방법이 없을까...?
  const checkIsTargetMesh = (target: BABYLON.TransformNode | BABYLON.Mesh): target is BABYLON.Mesh => {
    return target.getClassName() === 'Mesh';
  };
  return cy.getStoreState('selectingData.selectableObjects').then((selectableObjects) => {
    return selectableObjects.filter((object) => !checkIsTargetMesh(object) && !object.name.toLowerCase().includes('armature')).length;
  });
}

function getVisualizedRetargetMap() {
  return cy.getStoreState().then((state) => {
    const visualizedAssetIds = state.plaskProject.visualizedAssetIds;
    const retargetMaps = state.animationData.retargetMaps;
    const visualizedRetargetMap = retargetMaps.find((retargetMap) => retargetMap.assetId === visualizedAssetIds[0]);

    return visualizedRetargetMap;
  });
}

function getTransformNodeById(id: string) {
  return cy.getStoreState().then((state) => {
    return state.selectingData.selectableObjects.find((object) => object.id === id);
  });
}
