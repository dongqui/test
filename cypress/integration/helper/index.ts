type ModelFormat = 'fbx' | 'glb' | 'bvh' | 'fbx_unreal';

export const DEFAULT_FOLDER_NAME = 'Untitled';
export const DEFAULT_TEST_MODEL_COUNT = 4;
export const RETARGET_SOURCE_COUNT = 24;

export function waitLoadingDefaultModel() {
  cy.wait(['@knight', '@vanguard', '@zombie', '@mannequin'], { timeout: 10000 });
}

export function visitAndGetMockData() {
  cy.intercept('/models/Knight.glb', (req) => {
    // cy intercept는 브라우저 밖에 proxy에 있음.
    // 케쉬에 걸리면 요청이 intercept 까지 못오기 때문에 케쉬 관련 헤더 삭제.
    delete req.headers['if-none-match'];
    delete req.headers['if-modified-since'];
  }).as('knight');
  cy.intercept('/models/Vanguard.glb', (req) => {
    delete req.headers['if-none-match'];
    delete req.headers['if-modified-since'];
  }).as('vanguard');
  cy.intercept('/models/Zombie.glb', (req) => {
    delete req.headers['if-none-match'];
    delete req.headers['if-modified-since'];
  }).as('zombie');
  cy.intercept('/models/Mannequin.glb', (req) => {
    delete req.headers['if-none-match'];
    delete req.headers['if-modified-since'];
  }).as('mannequin');

  cy.visit('/');

  waitLoadingDefaultModel();
}

export function waitForModelNodeRendering() {
  cy.getByDataCy('lp-model', { timeout: 10000 });
}

export function isContextmenuExist() {
  cy.getByDataCyLike('contextmenu').should('exist');
}

export function createFolder(cyElement: Cypress.Chainable<JQuery<HTMLElement>> = cy.getByDataCy('lp-body')) {
  cyElement.rightclick();
  cy.getByDataCy('contextmenu-new-directory').click();
}

export function deleteNode(cyElement: Cypress.Chainable<JQuery<HTMLElement>>) {
  cyElement.rightclick('top');
  cy.getByDataCy('contextmenu-delete').click();
  cy.getByDataCy('modal-confirm').click();
}

export function editNodeName(cyElement: Cypress.Chainable<JQuery<HTMLElement>>, newName: string) {
  cyElement.rightclick();
  cy.getByDataCy('contextmenu-edit-name').click();
  cy.getByDataCy('edit-node-name').as('input').should('exist');
  cy.get('@input').clear().type(newName);
}

export function pasteFolderOn(cyElement: Cypress.Chainable<JQuery<HTMLElement>>) {
  cyElement.rightclick();
  cy.getByDataCy('contextmenu-paste').click();
}

export function copyOf(cyElement: Cypress.Chainable<JQuery<HTMLElement>>) {
  cyElement.rightclick();
  cy.getByDataCy('contextmenu-copy').click();
}

export function clickArrowIconOf(cyElement: Cypress.Chainable<JQuery<HTMLElement>>) {
  cyElement.find('[data-cy=arrow-icon]').first().click();
}

export function dataCy(dataCyAttribute: string) {
  return `[data-cy=${dataCyAttribute}]`;
}

export function modelVisualization(cyElement: Cypress.Chainable<JQuery<HTMLElement>>) {
  cyElement.rightclick('top');
  cy.getByDataCy('contextmenu-visualization').click('top');
}

export function dragSelectAllModelBones() {
  cy.get('canvas').then(($el) => {
    $el[0].dispatchEvent(new PointerEvent('pointerdown', { clientX: 300, clientY: 50 }));
    $el[0].dispatchEvent(new PointerEvent('pointermove', { clientX: 650, clientY: 550 }));
    $el[0].dispatchEvent(new PointerEvent('pointerup', { clientX: 650, clientY: 550 }));
  });
}

export function trigerBoneTrackContextmenu(contextmenuDataCy: string) {
  cy.getByDataCy('bone-track-item').first().rightclick();
  cy.getByDataCy(contextmenuDataCy).click();
}

export function addLayer() {
  cy.getByDataCy('add-layer').click();
}

export function dragScrubber(left: number, top: number, offset: number) {
  cy.window().then((win) => {
    cy.get('#scrubber')
      .trigger('mousedown', {
        view: win,
        force: true,
      })
      .trigger('mousemove', {
        clientX: left + offset,
        clientY: top,
        force: true,
      })
      .trigger('mouseup', {
        force: true,
        view: win,
      });
  });
}

export function unselectAllKeyframes() {
  cy.getByDataCy('keyframe').eq(3).rightclick();
  cy.getByDataCy('contextmenu-unselect-all').click();
}

export function getNodeName(cyElement: Cypress.Chainable<JQuery<HTMLElement>>) {
  return cyElement.find('[data-cy=node-name]');
}

export function compareRPSnapshot() {
  cy.get('canvas').toMatchImageSnapshot({
    imageConfig: {
      threshold: 0.01,
      thresholdType: 'percent',
      capture: 'viewport',
    },
  });
}

export function compareCPSkeltonSnapshot() {
  cy.getByDataCy('retarget-skeleton').toMatchImageSnapshot({
    imageConfig: {
      threshold: 0.01,
      thresholdType: 'percent',
      capture: 'viewport',
    },
  });
}

export function clickRetargetingFirstBone() {
  cy.getByDataCy('cp-tab-retargeting').click();
  cy.getByDataCyLike('cp-retarget-bone').first().click();
}

export function toggleFKController() {
  cy.getByDataCy('AnimationTitleToggle-FKController').click({ force: true });
  cy.getByDataCy('modal-confirm').click();
}

export function clickCPTab(tabName: 'animation' | 'retargeting') {
  cy.getByDataCy(`cp-tab-${tabName}`).click();
}

export function clickDropdown(dropdownName: string) {
  cy.getByDataCy(`dropdown-${dropdownName}`).click({ force: true });
}

export function clickConfirmOnModal() {
  cy.getByDataCy('modal-confirm').click();
}

export function clickEmptyMotionOfFirstModel(motionAlias: string) {
  cy.getByDataCy('lp-model').first().find(dataCy('lp-motion')).last().as(motionAlias).click();
}

export function getMotionsOfFirstModel() {
  return cy.getByDataCy('lp-model').first().find(dataCy('lp-motion'));
}

export function getLastMotionofFirstModel() {
  return cy.getByDataCy('lp-model').first().find(dataCy('lp-motion')).last();
}

export function handleOnboarding() {
  return cy.getByDataCy('onboarding-done').click();
}

export function exportModelorMotion($node_el: Cypress.Chainable<JQuery<HTMLElement>>, format: ModelFormat) {
  $node_el.rightclick();
  cy.getByDataCy('contextmenu-export').click();
  cy.getByDataCy('dropdown-format-btn').click();
  cy.getByDataCy(`dropdown-item-${format}`).click();
  cy.getByDataCy('modal-confirm').click();
}

export function convertAndExport(format: 'fbx' | 'fbx_unreal' | 'bvh') {
  //ISSUE: Click 'a' tag for download
  //https://github.com/cypress-io/cypress/issues/14857

  cy.window()
    .document()
    .then(function (doc) {
      cy.intercept('/api/converter/model', (req) => {
        req.reply((res) => {
          setTimeout(function () {
            doc.location.reload();
          }, 5000);
        });
      }).as('converter');

      exportModelorMotion(cy.get('@model_export'), format);
    });
}

export function isExportedFileDownloaded($node_el: Cypress.Chainable<JQuery<HTMLElement>>, format: ModelFormat) {
  $node_el.invoke('text').then((modelName) => {
    const modelNameWithExtension = [...modelName.split('.').slice(0, -1), format].join('.');

    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.task('existsSync', `${downloadsFolder}/${modelNameWithExtension}`, { timeout: 10000 }).then((isFileExist) => {
      expect(isFileExist).to.be.true;
    });
  });
}
