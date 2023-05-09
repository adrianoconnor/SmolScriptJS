import { SmolVariableType } from "./SmolVariableType";

export class SmolUndefined extends SmolVariableType {
    
    constructor() {
        super();
    }

    getValue():undefined {
        return undefined;
    }
}