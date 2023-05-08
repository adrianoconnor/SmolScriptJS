import { Expression } from "./Expression";
import { Token } from "../../Token";

export class AssignExpression implements Expression {

    getExpressionType() : string {
        return "Assign";
    }

    _name:Token;
    _value:Expression;

    constructor(name:Token, value:Expression) {
        this._name = name;
        this._value = value;
    }

    accept(visitor:any) {
        return visitor.visitAssignExpression(this);
    }
}