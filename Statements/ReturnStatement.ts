import { Expression } from "../Expressions/Expression";
import { Statement } from "./Statement";

export class ReturnStatement implements Statement {

    getStatementType() : string {
        return "Return";
    }   

    _expression?:Expression;

    constructor(expression?:Expression) {
        this._expression = expression;
    }

    accept(visitor:any) {
        return visitor.visitReturnStatement(this);
    }
}