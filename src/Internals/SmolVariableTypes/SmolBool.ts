import { SmolVariableType } from "./SmolVariableType";

export class SmolBool extends SmolVariableType {
    
    _value:boolean;

    constructor(value:boolean) {
        super();
        this._value = value;
    }

    getValue():boolean {
        return this._value;
    }

    toString():string
    {
        return `(SmolBool) ${this._value}`;
    }
}