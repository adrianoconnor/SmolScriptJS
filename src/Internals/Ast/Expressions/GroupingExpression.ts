import { Expression } from "./Expression";

export class GroupingExpression implements Expression {

    getExpressionType() : string {
        return "Grouping";
    }

    expr:Expression;

    constructor(expr:Expression) {
        this.expr = expr;
    }

    accept(visitor:any) {
        return visitor.visitGroupingExpression(this);
    }
}