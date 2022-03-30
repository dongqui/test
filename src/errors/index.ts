export class NoBoneImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoBoneImportError';
  }
}

export class NoMeshImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoBoneImportError';
  }
}

export class InvalidFormatImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FormatIssueImportError';
  }
}
