import { SmolVariableType } from "./SmolVariableType";

export class SmolFunction extends SmolVariableType {

    global_function_name:string;
    code_section:number;
    arity:number;
    param_variable_names:string[] = new Array<string>();

    constructor(global_function_name:string, code_section:number, arity:number, param_variable_names:string[])
    {
        super();
        this.global_function_name = global_function_name;
        this.code_section = code_section;
        this.arity = arity;
        this.param_variable_names = param_variable_names;
    }

    getValue() {
        return this;
    }

    toString():string
    {
        return `(SmolFunction) ${this.global_function_name}`;
    }
}