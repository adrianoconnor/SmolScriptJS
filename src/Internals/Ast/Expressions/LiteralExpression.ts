import { Expression } from "./Expression";

export class LiteralExpression extends Expression {

    _value:any;

    constructor(value:any) {
        super();

        this._value = value;
    }

    accept(visitor:any) {
        return visitor.visitLiteralExpression(this);
    }
}