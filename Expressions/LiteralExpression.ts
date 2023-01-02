import { Expression } from "./Expression";

export class LiteralExpression implements Expression {

    _value:any;

    constructor(value:any) {
        this._value = value;
    }
}