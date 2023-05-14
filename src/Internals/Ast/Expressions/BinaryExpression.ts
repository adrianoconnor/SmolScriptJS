/* eslint-disable @typescript-eslint/no-explicit-any */
import { Expression } from "./Expression";
import { Token } from "../../Token";

export class BinaryExpression implements Expression {

    getExpressionType() : string {
        return "Binary";
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
        return visitor.visitBinaryExpression(this);
    }
}