import { Token } from "../Token";
import { Expression } from "./Expression";

export class BinaryExpression implements Expression {

    _left:Expression;
    _operand:Token;
    _right:Expression;

    constructor(left:Expression, operand:Token, right:Expression) {
        this._left = left;
        this._operand = operand;
        this._right = right;
    }
}