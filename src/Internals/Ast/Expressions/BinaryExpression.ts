import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";
import { Token } from "../../Token";

export class BinaryExpression extends Expression {

    getExpressionType() : string {
        return "Binary";
    }

    left:Expression;
    op:Token;
    right:Expression;

    constructor(left:Expression, op:Token, right:Expression) {
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitBinaryExpression(this);
    }
}