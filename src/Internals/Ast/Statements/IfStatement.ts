/* eslint-disable @typescript-eslint/no-explicit-any */
import { Statement } from "./Statement";
import { Expression } from "../Expressions/Expression";

export class IfStatement implements Statement {

    getStatementType() : string {
        return "If";
    }

    expression:Expression;
    thenStatement:Statement;
    elseStatement?:Statement;

    constructor(expression:Expression, thenStatement:Statement, elseStatement:Statement|undefined) {
        this.expression = expression;
        this.thenStatement = thenStatement;
        this.elseStatement = elseStatement;
    }

    accept(visitor:any) {
        return visitor.visitIfStatement(this);
    }
}