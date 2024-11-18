/* eslint-disable @typescript-eslint/no-explicit-any */
import { Expression } from "./Expression";

export class GroupingExpression implements Expression {

    getExpressionType() : string {
        return "Grouping";
    }

    expr:Expression;
    castToStringForEmbeddedStringExpression:Boolean;

    constructor(expr:Expression, castToStringForEmbeddedStringExpression:Boolean = false) {
        this.expr = expr;
        this.castToStringForEmbeddedStringExpression = castToStringForEmbeddedStringExpression;
    }

    accept(visitor:any) {
        return visitor.visitGroupingExpression(this);
    }
}