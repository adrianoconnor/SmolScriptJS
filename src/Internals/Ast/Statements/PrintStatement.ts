import { Statement } from "./Statement";
import { Expression } from "../Expressions/Expression";

export class PrintStatement implements Statement {

    getStatementType() : string {
        return "Print";
    }

    _expression:Expression;

    constructor(expression:Expression) {
        this._expression = expression;
    }

    accept(visitor:any) {
        return visitor.visitPrintStatement(this);
    }
}