import { Expression } from "./Expression";
import { Token } from "../../Token";

export class UnaryExpression implements Expression {

    getExpressionType() : string {
        return "Unary";
    }

    op:Token;
    right:Expression;

    constructor(op:Token, right:Expression) {
        this.op = op;
        this.right = right;
    }

    accept(visitor:any) {
        return visitor.visitUnaryExpression(this);
    }
}