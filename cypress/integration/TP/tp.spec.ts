/// <reference types="cypress" />
import { skipOn } from '@cypress/skip-test';
import {
  visitAndGetMockData,
  modelVisualization,
  clickArrowIconOf,
  dragSelectAllModelBones,
  addLayer,
  trigerBoneTrackContextmenu,
  dragScrubber,
  unselectAllKeyframes,
  compareRPSnapshot,
} from '../helper';

describe.skip('TP 테스트', () => {
  before(() => {
    visitAndGetMockData();

    cy.getByDataCy('lp-model', { timeout: 10000 }).contains('DyingYup.glb').as('model');
    modelVisualization(cy.get('@model'));
    dragSelectAllModelBones();
  });

  it('Model bone 선택시 키프레임 생성', () => {
    cy.getByDataCy('keyframe').should('exist');
  });

  describe('Layer test', () => {
    it('선택된 레이어는 delete button disable', () => {
      cy.getByDataCy('layer')
        .its('length')
        .then((layerLength) => {
          cy.getByDataCy('layer').first().rightclick();
          cy.getByDataCy('contextmnenu-delete-layer').click();
          cy.getByDataCy('modal').should('not.exist');
          cy.getByDataCy('layer').should('have.length', layerLength);
        });
    });

    it('Contextmenu delete 클릭시에 레이어 삭제', () => {
      addLayer();
      cy.getByDataCy('layer')
        .its('length')
        .then((layerLength) => {
          cy.getByDataCy('layer').last().rightclick();
          cy.getByDataCy('contextmnenu-delete-layer').click();
          cy.getByDataCy('modal').should('exist');
          cy.getByDataCy('modal-confirm').click();
          cy.getByDataCy('layer').should('have.length', layerLength - 1);
        });
    });

    it('Layer를 펼치면 Bone track과 해당 keyframe이 보여집니다', () => {
      cy.getByDataCy('keyframe')
        .its('length')
        .then((prevKeyFrameLength) => {
          clickArrowIconOf(cy.getByDataCy('layer').first());
          cy.getByDataCy('bone-track-item').should('exist');
          cy.getByDataCy('keyframe').its('length').should('be.gt', prevKeyFrameLength);
          clickArrowIconOf(cy.getByDataCy('layer').first());
        });
    });

    it('Contextmenu Select all click시에 모든 Bone track 선택', () => {
      clickArrowIconOf(cy.getByDataCy('layer').first());
      trigerBoneTrackContextmenu('contextmenu-select-all');
      cy.getByDataCy('bone-track-item')
        .its('length')
        .then((boneTrackLength) => {
          cy.getByClassLike('BoneTrackItem_selected').should('have.length', boneTrackLength);
        });
    });

    it('Contextmenu Unselect all click시에 Bone track 선택 해제', () => {
      trigerBoneTrackContextmenu('contextmenu-unselect-all');
      cy.getByClassLike('BoneTrackItem_selected').should('not.exist');
    });

    it('Bonee track을펼치면 Property Track이 보여집니다', () => {
      clickArrowIconOf(cy.getByDataCy('bone-track-item').first());
      cy.getByDataCy('property-track-item').should('exist');
      clickArrowIconOf(cy.getByDataCy('bone-track-item').first());
    });

    after(() => {
      clickArrowIconOf(cy.getByDataCy('layer').first());
    });
  });

  describe('Keyframe test', () => {
    it('contextmnu select all row 클릭시 해당 행의 모든 keyframe 선택', () => {
      unselectAllKeyframes();
      cy.getByDataCy('keyframe')
        .its('length')
        .then((keyframeLength) => {
          cy.getByDataCy('keyframe').eq(3).rightclick();
          cy.getByDataCy('contextmenu-select-all-row').click();
          cy.getByClassLike('Keyframe_clicked').should('have.length', keyframeLength);
        });
    });

    it('contextmenu unselect all 클릭시에 모든 keyframe 선택 해제', () => {
      cy.getByDataCy('keyframe').eq(3).rightclick();
      cy.getByDataCy('contextmenu-select-all-row').click();
      cy.getByClassLike('Keyframe_clicked').should('exist');
      unselectAllKeyframes();
      cy.getByClassLike('Keyframe_clicked').should('not.exist');
    });

    it('contextmenu delete keyframe 선택시에 선택 된 키프레임 삭제', () => {
      cy.getByDataCy('keyframe')
        .its('length')
        .then((keyframeLength) => {
          // right click selection 문제???
          cy.getByDataCy('keyframe').eq(3).rightclick();
          cy.getByDataCy('contextmenu-delete-keyframe').click();
          cy.getByDataCy('keyframe').should('have.length', keyframeLength - 1);
        });
    });

    it('contextmnu select all column 클릭시 해당 열의 모든 keyframe 선택', () => {
      unselectAllKeyframes();
      clickArrowIconOf(cy.getByDataCy('layer').first());
      cy.getByDataCy('bone-track-item')
        .its('length')
        .then((boneTrackItemLength) => {
          const KEYFRAME_COUNT_FOR_LAYER = 1;
          cy.getByDataCy('keyframe').eq(3).rightclick();
          cy.getByDataCy('contextmenu-select-all-column').click();
          cy.getByClassLike('Keyframe_clicked').should('have.length', boneTrackItemLength + KEYFRAME_COUNT_FOR_LAYER);
        });
      clickArrowIconOf(cy.getByDataCy('layer').first());
    });

    it('keyframe 드래그해서 선택하기', () => {
      unselectAllKeyframes();
      cy.getByDataCy('tp').then(($el) => {
        const { top, left } = $el[0].getBoundingClientRect();
        cy.getByDataCy('tp').trigger('mousedown').trigger('mousemove', top, left, { force: true }).trigger('mouseup', top, left, { force: true });
        cy.getByClassLike('Keyframe_clicked').should('exist');
      });
    });

    it('드래그로 선택 -> delete : 선택된 모든 키프레임 삭제', () => {
      unselectAllKeyframes();
      cy.getByDataCy('keyframe')
        .its('length')
        .then((keyframeLength) => {
          cy.getByDataCy('tp').then(($el) => {
            const { top, left } = $el[0].getBoundingClientRect();
            cy.getByDataCy('tp').trigger('mousedown').trigger('mousemove', top, left, { force: true }).trigger('mouseup', top, left, { force: true });
            cy.getByClassLike('Keyframe_clicked')
              .its('length')
              .then((selectedKeyframeLength) => {
                cy.getByClassLike('Keyframe_clicked').eq(3).rightclick();
                cy.getByDataCy('contextmenu-delete-keyframe').click();
                cy.getByDataCy('keyframe').should('have.length', keyframeLength - selectedKeyframeLength);
              });
          });
        });
    });

    it('Select all column -> delete : 선택된 모든 열 삭제', () => {
      unselectAllKeyframes();
      cy.getByDataCy('keyframe')
        .its('length')
        .then((keyframeLengthPerRow) => {
          clickArrowIconOf(cy.getByDataCy('layer').first());
          cy.getByDataCy('keyframe')
            .its('length')
            .then((keyframeLength) => {
              // 첫 번째 줄은 클릭시, Select all column 기능 없이도 자동으로 선택된다.
              const KEY_FRAME_ON_SECOND_ROW = keyframeLengthPerRow + 5;
              cy.getByDataCy('keyframe').eq(KEY_FRAME_ON_SECOND_ROW).rightclick();
              cy.getByDataCy('contextmenu-select-all-column').click();
              cy.getByClassLike('Keyframe_clicked')
                .its('length')
                .then((selectedKeyframeLength) => {
                  cy.getByDataCy('keyframe').eq(KEY_FRAME_ON_SECOND_ROW).rightclick();
                  cy.getByDataCy('contextmenu-delete-keyframe').click();
                  cy.getByDataCy('keyframe').should('have.length', keyframeLength - selectedKeyframeLength);
                });
            });
          clickArrowIconOf(cy.getByDataCy('layer').first());
        });
    });

    it('Select all row -> delete : 선택된 모든 행 삭제', () => {
      unselectAllKeyframes();
      cy.getByDataCy('keyframe')
        .its('length')
        .then((keyframeLength) => {
          cy.getByDataCy('keyframe').eq(3).rightclick();
          cy.getByDataCy('contextmenu-select-all-row').click();
          cy.getByClassLike('Keyframe_clicked')
            .its('length')
            .then((selectedKeyframeLength) => {
              cy.getByDataCy('keyframe').eq(3).rightclick();
              cy.getByDataCy('contextmenu-delete-keyframe').click();
              cy.getByDataCy('keyframe').should('have.length', keyframeLength - selectedKeyframeLength);
            });
        });
    });
  });

  skipOn('headed', () => {
    it('Scrubber 이동시에 애니메이션 동작 및 Scrubber input value 변경', () => {
      cy.get('#scrubber').then(($scrubber) => {
        cy.getByDataCy('scrubber-input').then(($input) => {
          const { top, left } = $scrubber[0].getBoundingClientRect();
          dragScrubber(top, left, 150);
          cy.getByDataCy('scrubber-input').should('not.have.value', $input.val());
          cy.wait(1000);
          compareRPSnapshot();
        });
      });
    });
  });
});
