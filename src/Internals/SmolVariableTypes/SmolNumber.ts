import { SmolVariableType } from "./SmolVariableType";

export class SmolNumber extends SmolVariableType {

    _value:Number;

    constructor(value:Number) {
        super();
        this._value = value;
    }

    getValue():Number
    {
        return this._value;
    }

    toString():String
    {
        return `(SmolNumber) ${this._value}`;
    }
}