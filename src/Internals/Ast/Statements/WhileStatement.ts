/* eslint-disable @typescript-eslint/no-explicit-any */
import { Statement } from "./Statement";
import { Expression } from "../Expressions/Expression";

export class WhileStatement implements Statement {

    getStatementType() : string {
        return "While";
    }

    whileCondition:Expression;
    executeStatement:Statement;

    constructor(whileCondition:Expression, executeStatement:Statement) {
        this.whileCondition = whileCondition;
        this.executeStatement = executeStatement;
    }

    accept(visitor:any) {
        return visitor.visitWhileStatement(this);
    }
}