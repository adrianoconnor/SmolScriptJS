import { Statement } from "./Statement";
import { StatementVisitor } from "./StatementVisitor";
export class ContinueStatement extends Statement {

    getStatementType() : string {
        return "Continue";
    }

    accept<R>(visitor: StatementVisitor<R>): R {
        return visitor.visitContinueStatement(this);
    }

    tokenIndex:number|undefined;
}