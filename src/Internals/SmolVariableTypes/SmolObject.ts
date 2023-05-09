import { SmolVariableType } from "./SmolVariableType";

export class SmolObject extends SmolVariableType {
    

    constructor() {
        super();
    }

    getValue():SmolObject {
        return this;
    }
}