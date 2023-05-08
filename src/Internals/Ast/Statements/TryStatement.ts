import { Statement } from "./Statement";
import { Token } from "../../Token";
import {BlockStatement} from "./BlockStatement";

export class TryStatement implements Statement {

    getStatementType() : string {
        return "Try";
    }

    _tryBody:BlockStatement;
    _exceptionVariableName?:Token;
    _catchBody?:BlockStatement;
    _finallyBody?:BlockStatement;

    constructor(tryBody:BlockStatement, exceptionVariableName:any, catchBody:any, finallyBody:any) {
        this._tryBody = tryBody;
        this._exceptionVariableName = exceptionVariableName;
        this._catchBody = catchBody;
        this._finallyBody = finallyBody;
    }

    accept(visitor:any) {
        return visitor.visitTryStatement(this);
    }
}