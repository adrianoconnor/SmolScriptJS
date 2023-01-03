import { Expression } from "../Expressions/Expression";
import { Statement } from "./Statement";

export class IfStatement implements Statement {

    getStatementType() : string {
        return "If";
    }   

    public _expression:Expression;
    public _thenStatement:Statement;
    public _elseStatement?:Statement; // Optional, use undefined if not given

    constructor(expression:Expression, thenStatement:Statement, elseStatement?:Statement) {
        this._expression = expression;
        this._thenStatement = thenStatement;
        this._elseStatement = elseStatement;
    }

    accept(visitor:any) {
        return visitor.visitIfStatement(this);
    }
}