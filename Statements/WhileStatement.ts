import { Expression } from "../Expressions/Expression";
import { Statement } from "./Statement";

export class WhileStatement implements Statement {

    getStatementType() : string {
        return "While";
    }   

    _expression:Expression;
    _statement:Statement;

    constructor(expression:Expression, statement:Statement) {
        this._expression = expression;
        this._statement = statement;
    }

    accept(visitor:any) {
        return visitor.visitWhileStatement(this);
    }
}