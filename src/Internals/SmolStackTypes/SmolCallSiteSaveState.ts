import { SmolStackType } from "./SmolStackType";
import { Environment } from "../Environment";

export class SmolCallSiteSaveState extends SmolStackType {

    code_section:number;
    pc:number;
    previous_env:Environment;
    call_is_extern:boolean;

    constructor(code_section:number, pc:number, previous_env:Environment, call_is_extern:boolean) {
        super();
        this.code_section = code_section;
        this.pc = pc;
        this.previous_env = previous_env;
        this.call_is_extern = call_is_extern;
    }

    toString() {
        return `(SmolCallSiteSaveState)`;
    }
}
