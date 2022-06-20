import { PlaskCommand } from './types/PlaskCommand';

export class PlaskCommandManager {
  public static Instance: PlaskCommandManager;
  public static GetInstance() {
    return PlaskCommandManager.Instance;
  }

  constructor() {
    PlaskCommandManager.Instance = this;
  }

  private _pointer: number = -1;
  private _history: Array<PlaskCommand> = [];

  get history(): Array<PlaskCommand> {
    return this._history;
  }
  get pointer(): number {
    return this._pointer;
  }

  public redo() {
    if (this._history.length) {
      this._history[this._pointer].redo();
      this._pointer++;
    }
  }

  public undo() {
    if (this._history.length) {
      if (this._pointer) {
        this._history[this._pointer].undo();
        this._pointer--;
      }
    }
  }
  public add(action: object) {
    if (this._pointer > 0 && this._history.length > this._pointer) this.remove();
    console.log(action);
    this._history.push(new PlaskCommand(action, action));
    this._pointer++;
  }

  public remove() {
    this._history.slice(0, this._pointer);
  }
}

const plaskCommandManager = new PlaskCommandManager();
export default plaskCommandManager;
