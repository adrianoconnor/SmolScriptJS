import { SmolVariableType } from "./SmolVariableType";

export class SmolBool extends SmolVariableType {
    
    _value:Boolean;

    constructor(value:Boolean) {
        super();
        this._value = value;
    }

    getValue():Boolean {
        return this._value;
    }
}