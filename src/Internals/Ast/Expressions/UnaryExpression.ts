import { Token } from "../../Token";
import { Expression } from "./Expression";

export class UnaryExpression extends Expression {

    _operand:Token;
    _right:Expression;

    constructor(operand:Token, right:Expression) {
        super();

        this._operand = operand;
        this._right = right;
    }

    accept(visitor:any) {
        return visitor.visitUnaryExpression(this);
    }
}