/* eslint-disable @typescript-eslint/no-explicit-any */
import { Statement } from "./Statement";

export class BreakStatement implements Statement {

    getStatementType() : string {
        return "Break";
    }

    accept(visitor:any) {
        return visitor.visitBreakStatement(this);
    }
}