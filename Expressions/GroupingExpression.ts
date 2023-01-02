import { Expression } from "./Expression";

export class GroupingExpression implements Expression {

    _expr:Expression;

    constructor(expr:Expression) {
        this._expr = expr;
    }

}