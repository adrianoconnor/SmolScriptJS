import { Expression } from "./Expression";
import { Token } from "../../Token";

export class LogicalExpression implements Expression {

    getExpressionType() : string {
        return "Logical";
    }

    left:Expression;
    op:Token;
    right:Expression;

    constructor(left:Expression, op:Token, right:Expression) {
        this.left = left;
        this.op = op;
        this.right = right;
    }

    accept(visitor:any) {
        return visitor.visitLogicalExpression(this);
    }
}