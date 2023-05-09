import { SmolVariableType } from "./SmolVariableType";

export class SmolFunction extends SmolVariableType {

    constructor(value:Boolean) {
        super();
    }

    getValue() {
        return this;
    }
}