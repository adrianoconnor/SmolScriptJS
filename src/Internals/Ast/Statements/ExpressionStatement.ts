import { Statement } from "./Statement";
import { Expression } from "../Expressions/Expression";

export class ExpressionStatement implements Statement {

    getStatementType() : string {
        return "Expression";
    }

    _expression:Expression;

    constructor(expression:Expression) {
        this._expression = expression;
    }

    accept(visitor:any) {
        return visitor.visitExpressionStatement(this);
    }
}