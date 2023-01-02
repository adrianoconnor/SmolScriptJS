import { Token } from "../Token";
import { Expression } from "./Expression";

export class VariableExpression extends Expression {

    _name:Token;

    constructor(name:Token) {
        super();

        this._name = name;
    }

    accept(visitor:any) {
        return visitor.visitVariableExpression(this);
    }
}