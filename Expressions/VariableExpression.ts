import { Token } from "../Token";
import { Expression } from "./Expression";

export class VariableExpression implements Expression {

    _name:Token;

    constructor(name:Token) {
        this._name = name;
    }
}