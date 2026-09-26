import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";
import { Token } from "../../Token";

export class UnaryExpression extends Expression {

    getExpressionType() : string {
        return "Unary";
    }

    op:Token;
    right:Expression;

    constructor(op:Token, right:Expression) {
        super();
        this.op = op;
        this.right = right;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitUnaryExpression(this);
    }
}