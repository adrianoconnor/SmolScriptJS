import { Statement } from "./Statement";
import { Expression } from "../Expressions/Expression";

export class PrintStatement implements Statement {

    getStatementType() : string {
        return "Print";
    }

    expression:Expression;

    constructor(expression:Expression) {
        this.expression = expression;
    }

    accept(visitor:any) {
        return visitor.visitPrintStatement(this);
    }
}