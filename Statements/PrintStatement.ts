import { Expression } from "../Expressions/Expression";
import { Statement } from "./Statement";

export class PrintStatement implements Statement {

    _expression:Expression;

    constructor(expression:Expression) {
        this._expression = expression;
    }

    accept(visitor:any) {
        return visitor.visitPrintStatement(this);
    }
}