import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";

export class GroupingExpression extends Expression {

    getExpressionType() : string {
        return "Grouping";
    }

    expr:Expression;
    castToStringForEmbeddedStringExpression:boolean;

    constructor(expr:Expression, castToStringForEmbeddedStringExpression:boolean = false) {
        super();
        this.expr = expr;
        this.castToStringForEmbeddedStringExpression = castToStringForEmbeddedStringExpression;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitGroupingExpression(this);
    }
}