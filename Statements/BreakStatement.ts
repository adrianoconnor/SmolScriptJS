import { Expression } from "../Expressions/Expression";
import { Statement } from "./Statement";

export class BreakStatement implements Statement {

    constructor() {
    }

    accept(visitor:any) {
        return visitor.visitBreakStatement(this);
    }
}