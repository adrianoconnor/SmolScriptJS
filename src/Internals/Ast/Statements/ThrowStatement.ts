import { Statement } from "./Statement";
import { Expression } from "../Expressions/Expression";

export class ThrowStatement implements Statement {

    getStatementType() : string {
        return "Throw";
    }

    expression:Expression;

    constructor(expression:Expression) {
        this.expression = expression;
    }

    accept(visitor:any) {
        return visitor.visitThrowStatement(this);
    }
}