import { Expression } from "./Expression";
import { Token } from "../../Token";

export class UnaryExpression implements Expression {

    getExpressionType() : string {
        return "Unary";
    }

    _op:Token;
    _right:Expression;

    constructor(op:Token, right:Expression) {
        this._op = op;
        this._right = right;
    }

    accept(visitor:any) {
        return visitor.visitUnaryExpression(this);
    }
}