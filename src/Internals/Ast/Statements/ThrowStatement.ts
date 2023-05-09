import { Statement } from "./Statement";
import { Expression } from "../Expressions/Expression";

export class ThrowStatement implements Statement {

    getStatementType() : string {
        return "Throw";
    }

    _expression:Expression;

    constructor(expression:Expression) {
        this._expression = expression;
    }
    
    accept(visitor:any) {
        return visitor.visitThrowStatement(this);
    }
}