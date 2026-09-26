import { Statement } from "./Statement";
import { StatementVisitor } from "./StatementVisitor";

export class BreakStatement extends Statement {

    getStatementType() : string {
        return "Break";
    }

    accept<R>(visitor: StatementVisitor<R>): R {
        return visitor.visitBreakStatement(this);
    }

    tokenIndex:number|undefined;
}