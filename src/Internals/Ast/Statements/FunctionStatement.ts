/* eslint-disable @typescript-eslint/no-explicit-any */
import { Statement } from "./Statement";
import { Token } from "../../Token";
import {BlockStatement} from "./BlockStatement";

export class FunctionStatement implements Statement {

    getStatementType() : string {
        return "Function";
    }

    name:Token;
    parameters:Token[];
    functionBody:BlockStatement;

    constructor(name:Token, parameters:Token[], functionBody:BlockStatement) {
        this.name = name;
        this.parameters = parameters;
        this.functionBody = functionBody;
    }

    accept(visitor:any) {
        return visitor.visitFunctionStatement(this);
    }
}