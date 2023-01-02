import { Token } from "../Token";
import { BlockStatement } from "./BlockStatement";
import { Statement } from "./Statement";

export class FunctionStatement implements Statement {

    _name?:Token;
    _parameters:Token[];
    _statements:BlockStatement;

    constructor(name:Token, parameters:Token[], statements:BlockStatement) {
        this._name = name;
        this._parameters = parameters;
        this._statements = statements;
    }

    accept(visitor:any) {
        return visitor.visitFunctionStatement(this);
    }
}