import { Expression } from "./Expression";

export class GroupingExpression extends Expression {

    _expr:Expression;

    constructor(expr:Expression) {
        super();

        this._expr = expr;
    }

    accept(visitor:any) {
        return visitor.visitGroupingExpression(this);
    }
}