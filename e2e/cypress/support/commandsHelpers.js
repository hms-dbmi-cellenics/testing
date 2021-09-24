import 'cypress-file-upload';

const selectFilesFromInput = (filePaths) => {
  cy.get('[data-test-id="file-upload-input"]')
    .attachFile(filePaths, { simulatedFilePath: filePaths });
};

const dragAndDropFiles = (filePaths) => {
  cy.get('[data-test-id="file-upload-dropzone"]')
    .attachFile(filePaths, { subjectType: 'drag-n-drop', simulatedFilePath: filePaths });
};

export { selectFilesFromInput, dragAndDropFiles };