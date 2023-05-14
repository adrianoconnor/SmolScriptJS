/* eslint-disable @typescript-eslint/no-explicit-any */
import { Statement } from "./Statement";

export class ContinueStatement implements Statement {

    getStatementType() : string {
        return "Continue";
    }

    accept(visitor:any) {
        return visitor.visitContinueStatement(this);
    }
}