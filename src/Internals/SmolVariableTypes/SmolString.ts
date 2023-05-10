import { SmolVariableType } from "./SmolVariableType";

export class SmolString extends SmolVariableType {
    
    _value:string;

    constructor(value:string) {
        super();
        this._value = value;
    }

    getValue():string
    {
        return this._value;
    }

    toString():string
    {
        return `(SmolString) ${this._value}`;
    }
}