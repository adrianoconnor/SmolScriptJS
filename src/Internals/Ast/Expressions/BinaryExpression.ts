import { Expression } from "./Expression";
import { Token } from "../../Token";

export class BinaryExpression implements Expression {

    getExpressionType() : string {
        return "Binary";
    }

    _left:Expression;
    _op:Token;
    _right:Expression;

    constructor(left:Expression, op:Token, right:Expression) {
        this._left = left;
        this._op = op;
        this._right = right;
    }

    accept(visitor:any) {
        return visitor.visitBinaryExpression(this);
    }
}