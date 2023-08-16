import { SmolStackType } from "./SmolStackType";
import { Environment } from "../Environment";

export class SmolTryRegionSaveState extends SmolStackType {

    code_section:number;
    PC:number;
    this_env:Environment;
    jump_exception:number;

    constructor(code_section:number, PC:number, this_env:Environment, jump_exception:number) {
        super();
        this.code_section = code_section;
        this.PC = PC;
        this.this_env = this_env;
        this.jump_exception = jump_exception;
    }

    toString() {
        return `(SmolTryRegionSaveState)`;
    }
}