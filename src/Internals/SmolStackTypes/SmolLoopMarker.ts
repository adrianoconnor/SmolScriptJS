import { SmolStackType } from "./SmolStackType";
import { Environment } from "../Environment";

export class SmolLoopMaker extends SmolStackType {

    current_env:Environment;

    constructor(current_env:Environment) {
        super();
        this.current_env = current_env;
    }
}