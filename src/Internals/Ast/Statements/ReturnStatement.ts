import { Statement } from "./Statement";
import { Expression } from "../Expressions/Expression";

export class ReturnStatement implements Statement {

    getStatementType() : string {
        return "Return";
    }

    _expression?:Expression;

    constructor(expression:any) {
        this._expression = expression;
    }

    accept(visitor:any) {
        return visitor.visitReturnStatement(this);
    }
}