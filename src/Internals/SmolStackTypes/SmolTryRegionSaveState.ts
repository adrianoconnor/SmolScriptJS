import { SmolStackType } from './SmolStackType';
import { Environment } from '../Environment';

export class SmolTryRegionSaveState extends SmolStackType {
  codeSection: number;
  pc: number;
  thisEnv: Environment;
  jumpException: number;

  constructor(code_section: number, PC: number, this_env: Environment, jump_exception: number) {
    super();
    this.codeSection = code_section;
    this.pc = PC;
    this.thisEnv = this_env;
    this.jumpException = jump_exception;
  }

  toString() {
    return `(SmolTryRegionSaveState)`;
  }
}
