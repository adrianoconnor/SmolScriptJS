import { SmolVariableType } from "./SmolVariableType";

export class SmolError extends SmolVariableType {
    
    _message:string;

    constructor(message:string) {
        super();
        this._message = message;
    }

    getValue():string {
        return `ERROR: ${this._message}`;
    }
}