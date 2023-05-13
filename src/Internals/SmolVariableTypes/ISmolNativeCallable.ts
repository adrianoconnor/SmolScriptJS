import { SmolVariableType } from "./SmolVariableType";

export abstract class ISmolNativeCallable extends SmolVariableType {
    
    constructor() {
        super();
    }

    getValue():any {
        return undefined;
    }

    abstract setProp(name:string, value:any): void;

    abstract getProp(name:string): SmolVariableType;

    abstract nativeCall(funcName:string, parameters:SmolVariableType[]) : SmolVariableType;
}