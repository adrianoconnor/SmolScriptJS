import { SmolVariableType } from "./SmolVariableType";

export class SmolNull extends SmolVariableType {
    
    constructor() {
        super();
    }

    getValue():null {
        return null;
    }
}