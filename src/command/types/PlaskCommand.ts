import { v4 } from 'uuid';

interface Command {
  redo: {
    type: string;
    payload: Array<any>;
  };
  undo: {
    type: string;
    payload: Array<any>;
  };
}

/**
 * Entities make the link between the redux state, babylon js and the serialized format of plask
 * They contain all the necessary data to save and restore the redux state and the Babylon state.
 */
export class PlaskCommand {
  private _command: Command;
  constructor(redo: any, undo: any) {
    this._command = {
      redo: {
        type: redo.type,
        payload: redo.payload ?? [],
      },
      undo: {
        type: undo.type,
        payload: undo.payload ?? [],
      },
    };
  }

  get command() {
    return this._command;
  }

  public redo(): void {
    console.log(`REDO ACTION: ${this._command.redo.type}`);
    return;
  }
  public undo(): void {
    console.log(`UNDO ACTION: ${this._command.undo.type}`);
    return;
  }
}
