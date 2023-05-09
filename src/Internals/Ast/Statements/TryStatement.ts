import { Statement } from "./Statement";
import { Token } from "../../Token";
import {BlockStatement} from "./BlockStatement";

export class TryStatement implements Statement {

    getStatementType() : string {
        return "Try";
    }

    tryBody:BlockStatement;
    exceptionVariableName?:Token;
    catchBody?:BlockStatement;
    finallyBody?:BlockStatement;

    constructor(tryBody:BlockStatement, exceptionVariableName:Token|undefined, catchBody:BlockStatement|undefined, finallyBody:BlockStatement|undefined) {
        this.tryBody = tryBody;
        this.exceptionVariableName = exceptionVariableName;
        this.catchBody = catchBody;
        this.finallyBody = finallyBody;
    }

    accept(visitor:any) {
        return visitor.visitTryStatement(this);
    }
}