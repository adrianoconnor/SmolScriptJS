/* eslint-disable @typescript-eslint/no-explicit-any */
import { Statement } from "./Statement";
import { Expression } from "../Expressions/Expression";

export class ReturnStatement implements Statement {

    getStatementType() : string {
        return "Return";
    }

    expression?:Expression;

    constructor(expression:Expression|undefined) {
        this.expression = expression;
    }

    accept(visitor:any) {
        return visitor.visitReturnStatement(this);
    }
}