import { Expression } from "./Expression";
import { Token } from "../../Token";
import {BlockStatement} from "../Statements/BlockStatement";

export class FunctionExpression implements Expression {

    getExpressionType() : string {
        return "Function";
    }

    parameters:Token[];
    functionBody:BlockStatement;

    constructor(parameters:Token[], functionBody:BlockStatement) {
        this.parameters = parameters;
        this.functionBody = functionBody;
    }

    accept(visitor:any) {
        return visitor.visitFunctionExpression(this);
    }
}