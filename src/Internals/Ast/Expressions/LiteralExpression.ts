import { Expression } from "./Expression";

export class LiteralExpression implements Expression {

    getExpressionType() : string {
        return "Literal";
    }

    _value:any;

    constructor(value:any) {
        this._value = value;
    }

    accept(visitor:any) {
        return visitor.visitLiteralExpression(this);
    }
}