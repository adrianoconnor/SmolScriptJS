import { Statement } from "./Statement";
import { StatementVisitor } from "./StatementVisitor";
import { Token } from "../../Token";
import {BlockStatement} from "./BlockStatement";

export class TryStatement extends Statement {

    getStatementType() : string {
        return "Try";
    }

    tryBody:BlockStatement;
    exceptionVariableName?:Token;
    catchBody?:BlockStatement;
    finallyBody?:BlockStatement;

    constructor(tryBody:BlockStatement, exceptionVariableName:Token|undefined, catchBody:BlockStatement|undefined, finallyBody:BlockStatement|undefined) {
        super();
        this.tryBody = tryBody;
        this.exceptionVariableName = exceptionVariableName;
        this.catchBody = catchBody;
        this.finallyBody = finallyBody;
    }

    accept<R>(visitor: StatementVisitor<R>): R {
        return visitor.visitTryStatement(this);
    }
}