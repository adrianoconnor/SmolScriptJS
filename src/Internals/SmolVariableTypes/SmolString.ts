import { SmolVariableType } from "./SmolVariableType";

export class SmolString extends SmolVariableType {
    
    _value:String;

    constructor(value:String) {
        super();
        this._value = value;
    }

    getValue():String
    {
        return this._value;
    }

    toString():String
    {
        return `(SmolString) ${this._value}`;
    }
}