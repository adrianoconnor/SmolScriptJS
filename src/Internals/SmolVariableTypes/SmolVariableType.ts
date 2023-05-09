import { SmolStackType } from "../SmolStackTypes/SmolStackType";
import { SmolNumber } from "./SmolNumber";

export abstract class SmolVariableType extends SmolStackType {

    abstract getValue():any;

    equals(compareTo:SmolVariableType):Boolean {
        return this.getValue() == compareTo.getValue();
    }
}