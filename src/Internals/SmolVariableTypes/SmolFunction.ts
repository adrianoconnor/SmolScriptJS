import { SmolVariableType } from './SmolVariableType';

export class SmolFunction extends SmolVariableType {
  globalFunctionName: string;
  codeSection: number;
  arity: number;
  parameterNames: string[] = new Array<string>();

  constructor(
    global_function_name: string,
    code_section: number,
    arity: number,
    param_variable_names: string[]
  ) {
    super();
    this.globalFunctionName = global_function_name;
    this.codeSection = code_section;
    this.arity = arity;
    this.parameterNames = param_variable_names;
  }

  getValue() {
    return this;
  }

  toString(): string {
    return `(SmolFunction) ${this.globalFunctionName}`;
  }
}
