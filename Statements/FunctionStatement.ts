import { Token } from "../Token";
import { BlockStatement } from "./BlockStatement";
import { Statement } from "./Statement";

export class FunctionStatement implements Statement {

    getStatementType() : string {
        return "Function";
    }   

    _name?:Token;
    _parameters:Token[];
    _block:BlockStatement;

    constructor(name:any, parameters:Token[], block:BlockStatement) {
        this._name = name;
        this._parameters = parameters;
        this._block = block;
    }

    accept(visitor:any) {
        return visitor.visitFunctionStatement(this);
    }
}