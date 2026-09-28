import { SmolStackType } from './SmolStackType';
import { Environment } from '../Environment';

export class SmolCallSiteSaveState extends SmolStackType {
  codeSection: number;
  pc: number;
  previousEnv: Environment;
  callIsExtern: boolean;

  constructor(codeSection: number, pc: number, previousEnv: Environment, callIsExtern: boolean) {
    super();
    this.codeSection = codeSection;
    this.pc = pc;
    this.previousEnv = previousEnv;
    this.callIsExtern = callIsExtern;
  }

  toString() {
    return `(SmolCallSiteSaveState)`;
  }
}
