import { Expression } from "./Expression";
import { Token } from "../../Token";

export class ObjectInitializerExpression implements Expression {

    getExpressionType() : string {
        return "ObjectInitializer";
    }

    _name:Token;
    _value:Expression;

    constructor(name:Token, value:Expression) {
        this._name = name;
        this._value = value;
    }

    accept(visitor:any) {
        return visitor.visitObjectInitializerExpression(this);
    }
}