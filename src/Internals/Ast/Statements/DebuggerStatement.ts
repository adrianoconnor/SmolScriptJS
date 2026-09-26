import { Statement } from "./Statement";
import { StatementVisitor } from "./StatementVisitor";
export class DebuggerStatement extends Statement {

    getStatementType() : string {
        return "Debugger";
    }

    accept<R>(visitor: StatementVisitor<R>): R {
        return visitor.visitDebuggerStatement(this);
    }

    tokenIndex:number|undefined;
}