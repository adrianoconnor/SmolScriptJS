import { Environment } from '../Environment';
import { SmolVariableType } from './SmolVariableType';

export class SmolObject extends SmolVariableType {
  objectEnv: Environment;
  className: string;

  constructor(objectEnv: Environment, className: string) {
    super();
    this.objectEnv = objectEnv;
    this.className = className;
  }

  getValue() {
    return this;
  }

  toString() {
    if (this.className != '') {
      return `(SmolInstance, class_name = ${this.className})`;
    } else {
      return `(SmolObject)`;
    }
  }

  getProp(propName: string): SmolVariableType {
    switch (propName) {
      default:
        throw new Error(`${this} cannot handle native property ${propName}`);
    }
  }

  setProp(propName: string, value: SmolVariableType) {
    throw new Error('Not a valid target');
  }

  nativeCall(funcName: string, parameters: SmolVariableType[]): SmolVariableType {
    switch (funcName) {
      default:
        throw new Error(`Object cannot handle native function ${funcName}`);
    }
  }

  static staticCall(funcName: string, parameters: SmolVariableType[]): SmolVariableType {
    switch (funcName) {
      case 'constructor':
        return new SmolObject(new Environment(), 'Object');

      default:
        throw new Error(`Object class cannot handle static function ${funcName}`);
    }
  }
}
