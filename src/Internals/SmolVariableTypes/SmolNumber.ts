import { ISmolNativeCallable } from "./ISmolNativeCallable";
import { SmolString } from "./SmolString";
import { SmolVariableType } from "./SmolVariableType";

export class SmolNumber extends ISmolNativeCallable {
    
    setProp(name: string, value: any): void {
        throw new Error("Not implemented.");
    }

    getProp(name: string): SmolVariableType {
        throw new Error("Not implemented.");
    }
    
    nativeCall(funcName: string, parameters: SmolVariableType[]): SmolVariableType {

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