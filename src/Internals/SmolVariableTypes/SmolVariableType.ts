import { SmolStackType } from "../SmolStackTypes/SmolStackType";

export abstract class SmolVariableType extends SmolStackType {

    // I have no idea how I could do this without any -- it really can return any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abstract getValue():any;

    equals(compareTo:SmolVariableType):boolean {
        return (this.getValue() == compareTo.getValue());
    }
}