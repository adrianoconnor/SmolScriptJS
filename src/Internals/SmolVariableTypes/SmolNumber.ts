import { ISmolNativeCallable } from "./ISmolNativeCallable";
import { SmolString } from "./SmolString";
import { SmolVariableType } from "./SmolVariableType";

export class SmolNumber extends ISmolNativeCallable {

    setProp(): void {
        throw new Error("Method not implemented.");
    }
    

    getProp(): SmolVariableType {
        throw new Error("Method not implemented.");
    }
    
    nativeCall(funcName: string): SmolVariableType {

        if (funcName === "toString") {
            return new SmolString(this._value.toString());
        }
        
        throw new Error("Method not implemented.");
    }

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