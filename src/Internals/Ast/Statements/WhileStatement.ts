import { Statement } from "./Statement";
import { Expression } from "../Expressions/Expression";

export class WhileStatement implements Statement {

    getStatementType() : string {
        return "While";
    }

    _whileCondition:Expression;
    _executeStatement:Statement;

    constructor(whileCondition:Expression, executeStatement:Statement) {
        this._whileCondition = whileCondition;
        this._executeStatement = executeStatement;
    }

    accept(visitor:any) {
        return visitor.visitWhileStatement(this);
    }
}