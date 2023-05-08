import { Statement } from "./Statement";
import { Token } from "../../Token";
import {BlockStatement} from "./BlockStatement";

export class FunctionStatement implements Statement {

    getStatementType() : string {
        return "Function";
    }

    _name:Token;
    _parameters:Token[];
    _functionBody:BlockStatement;

    constructor(name:Token, parameters:Token[], functionBody:BlockStatement) {
        this._name = name;
        this._parameters = parameters;
        this._functionBody = functionBody;
    }

    accept(visitor:any) {
        return visitor.visitFunctionStatement(this);
    }
}