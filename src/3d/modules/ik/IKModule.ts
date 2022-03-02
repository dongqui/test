import { Module } from '../Module';

type IKModuleState = {};
export class IKModule extends Module<IKModuleState> {
  public state = {} as IKModuleState;
}
