import { Statement } from "./Statement";
import { Expression } from "../Expressions/Expression";

export class IfStatement implements Statement {

    getStatementType() : string {
        return "If";
    }

    _expression:Expression;
    _thenStatement:Statement;
    _elseStatement?:Statement;

    constructor(expression:Expression, thenStatement:Statement, elseStatement:any) {
        this._expression = expression;
        this._thenStatement = thenStatement;
        this._elseStatement = elseStatement;
    }

    accept(visitor:any) {
        return visitor.visitIfStatement(this);
    }
}