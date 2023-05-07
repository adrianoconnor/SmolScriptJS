import { Token } from "../../Token";
import { Expression } from "./Expression";

export class BinaryExpression extends Expression {

    _left:Expression;
    _operand:Token;
    _right:Expression;

    constructor(left:Expression, operand:Token, right:Expression) {
        super();

        this._left = left;
        this._operand = operand;
        this._right = right;
    }

    accept(visitor:any) {
        return visitor.visitBinaryExpression(this);
    }
}