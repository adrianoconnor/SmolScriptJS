import { Token } from "../Token";
import { Expression } from "../Expressions/Expression";
import { Statement } from "./Statement";

export class ExpressionStatement implements Statement {

    _expression:Expression;

    constructor(expression:Expression) {
        this._expression = expression;
    }
}