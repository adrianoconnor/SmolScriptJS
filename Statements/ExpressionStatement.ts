import { Token } from "../Token";
import { Expression } from "../Expressions/Expression";
import { Statement } from "./Statement";

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