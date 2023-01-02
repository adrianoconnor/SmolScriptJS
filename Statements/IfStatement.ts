import { Expression } from "../Expressions/Expression";
import { Statement } from "./Statement";

export class IfStatement implements Statement {

    _expression:Expression;
    _statement:Statement;
    _then?:Statement; // Option, use undefined if not given

    constructor(expression:Expression, statement:Statement, then:Statement) {
        this._expression = expression;
        this._statement = statement;
        this._then = then;
    }

    accept(visitor:any) {
        return visitor.visitIfStatement(this);
    }
}