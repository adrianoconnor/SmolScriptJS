import { Expression } from "./Expression";
import { Token } from "../../Token";

export class SetExpression implements Expression {

    getExpressionType() : string {
        return "Set";
    }

    _obj:Expression;
    _name:Token;
    _value:Expression;

    constructor(obj:Expression, name:Token, value:Expression) {
        this._obj = obj;
        this._name = name;
        this._value = value;
    }

    accept(visitor:any) {
        return visitor.visitSetExpression(this);
    }
}