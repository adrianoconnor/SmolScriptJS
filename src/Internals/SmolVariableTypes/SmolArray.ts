import { SmolVariableType } from "./SmolVariableType";

export class SmolArray extends SmolVariableType {
    
    _elements:SmolVariableType[] = new Array<SmolVariableType>();

    constructor() {
        super();
    }

    getValue():SmolArray {
        return this;
    }
}