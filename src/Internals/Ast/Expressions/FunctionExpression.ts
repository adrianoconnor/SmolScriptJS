import { Expression } from "./Expression";
import { Token } from "../../Token";
import {BlockStatement} from "../Statements/BlockStatement";

export class FunctionExpression implements Expression {

    getExpressionType() : string {
        return "Function";
    }

    _parameters:Token[];
    _functionBody:BlockStatement;

    constructor(parameters:Token[], functionBody:BlockStatement) {
        this._parameters = parameters;
        this._functionBody = functionBody;
    }

    accept(visitor:any) {
        return visitor.visitFunctionExpression(this);
    }
}