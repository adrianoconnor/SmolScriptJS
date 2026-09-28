import { SmolStackType } from './SmolStackType';
import { Environment } from '../Environment';

export class SmolLoopMarker extends SmolStackType {
  currentEnv: Environment;

  constructor(currentEnv: Environment) {
    super();
    this.currentEnv = currentEnv;
  }

  toString() {
    return `(SmolLoopMarker)`;
  }
}
