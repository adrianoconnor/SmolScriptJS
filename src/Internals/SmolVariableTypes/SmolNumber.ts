import { SmolVariableType } from "./SmolVariableType";

export class SmolNumber extends SmolVariableType {

    _value:number;

    constructor(value:number) {
        super();
        this._value = value;
    }

    getValue():number
    {
        return this._value;
    }

    toString():string
    {
        return `(SmolNumber) ${this._value}`;
    }
}