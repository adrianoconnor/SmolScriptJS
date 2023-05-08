import { Expression } from "./Expression";
import { Token } from "../../Token";

export class LogicalExpression implements Expression {

    getExpressionType() : string {
        return "Logical";
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
        return visitor.visitLogicalExpression(this);
    }
}