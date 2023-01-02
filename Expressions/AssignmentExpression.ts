import { Token } from "../Token";
import { Expression } from "./Expression";

export class AssignmentExpression implements Expression {

    _name:Token;
    _value:Expression;

    constructor(name:Token, value:Expression) {
        this._name = name;
        this._value = value;
    }
}