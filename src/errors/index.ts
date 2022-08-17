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

export const TOOL_PAYMENT_NOT_ALLOWED_FUNCTION = 400.701;
export const TOOL_PAYMENT_MAXIMUM_SIZE = 400.702;
export const TOOL_PAYMENT_NOT_ENOUGH_CREDIT = 400.703;
export const INVALID_MOCAP_VIDEO_DURATION = 400.9;
