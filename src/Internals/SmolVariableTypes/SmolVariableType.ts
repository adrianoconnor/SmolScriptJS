import { SmolStackType } from '../SmolStackTypes/SmolStackType';

export abstract class SmolVariableType extends SmolStackType {
  abstract getValue(): any;

  equals(compareTo: SmolVariableType): boolean {
    return this.getValue() == compareTo.getValue();
  }

  toString(): string {
    // Returns in format "(SmolNumber) 123"
    return `(${this.constructor.name}) ${this.getValue()}`;
  }

  static staticCall(
    funcName: string,
    parameters: SmolVariableType[]
  ): SmolVariableType {
    throw new Error('Static call not implemented for this type');
  }
}
