import { SmolStackType } from "../SmolStackTypes/SmolStackType";
import { SmolNumber } from "./SmolNumber";

export abstract class SmolVariableType extends SmolStackType {

    abstract getValue():any;

    equals(compareTo:SmolVariableType):boolean {
        return this.getValue() == compareTo.getValue();
    }
}