import { Statement } from "./Statement";
import { StatementVisitor } from "./StatementVisitor";
import { Expression } from "../Expressions/Expression";

export class WhileStatement extends Statement {

    getStatementType() : string {
        return "While";
    }

    whileCondition:Expression;
    executeStatement:Statement;

    constructor(whileCondition:Expression, executeStatement:Statement) {
        super();
        this.whileCondition = whileCondition;
        this.executeStatement = executeStatement;
    }

    accept<R>(visitor: StatementVisitor<R>): R {
        return visitor.visitWhileStatement(this);
    }

    exprFirstTokenIndex:number|undefined;
    exprLastTokenIndex:number|undefined;
    stmtFirstTokenIndex:number|undefined;
    stmtLastTokenIndex:number|undefined;
}