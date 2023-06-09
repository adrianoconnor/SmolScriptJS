import { ISmolNativeCallable } from "./ISmolNativeCallable";
import { SmolNumber } from "./SmolNumber";
import { SmolRegExp } from "./SmolRegExp";
import { SmolVariableType } from "./SmolVariableType";

export class SmolString extends ISmolNativeCallable {
    
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

    setProp(name:string): void {
        throw new Error(`Property setting ${name} does not apply to String`);
    }

    getProp(name:string): SmolVariableType {
        if (name === "length") {
            return new SmolNumber(this._value.length);
        }

        throw new Error(`Can't get property ${name} on SmolString`);
    }

    nativeCall(funcName:string, parameters:SmolVariableType[]) : SmolVariableType {

        if (funcName === "search") {
            const regex = parameters[0] as SmolRegExp;

            return new SmolNumber(this._value.search(regex._regex));
        }

        throw new Error();
    }
}