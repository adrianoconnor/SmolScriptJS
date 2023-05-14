/* eslint-disable @typescript-eslint/no-explicit-any */
import { Statement } from "./Statement";
import { Expression } from "../Expressions/Expression";

export class ExpressionStatement implements Statement {

    getStatementType() : string {
        return "Expression";
    }

    expression:Expression;

    constructor(expression:Expression) {
        this.expression = expression;
    }

    accept(visitor:any) {
        return visitor.visitExpressionStatement(this);
    }
}