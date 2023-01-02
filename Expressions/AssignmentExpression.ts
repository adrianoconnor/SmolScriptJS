import { Token } from "../Token";
import { Expression } from "./Expression";

export class AssignmentExpression extends Expression {

    _name:Token;
    _value:Expression;

    constructor(name:Token, value:Expression) {
        super();

        this._name = name;
        this._value = value;
    }

    accept(visitor:any) {
        return visitor.visitAssignmentExpression(this);
    }
}