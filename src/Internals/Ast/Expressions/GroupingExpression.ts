import { Expression } from "./Expression";

export class GroupingExpression implements Expression {

    getExpressionType() : string {
        return "Grouping";
    }

    _expr:Expression;

    constructor(expr:Expression) {
        this._expr = expr;
    }

    accept(visitor:any) {
        return visitor.visitGroupingExpression(this);
    }
}