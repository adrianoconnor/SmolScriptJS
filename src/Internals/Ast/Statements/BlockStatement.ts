/* eslint-disable @typescript-eslint/no-explicit-any */
import { Statement } from "./Statement";

export class BlockStatement implements Statement {

    getStatementType() : string {
        return "Block";
    }

    statements:Statement[];

    constructor(statements:Statement[]) {
        this.statements = statements;
    }

    accept(visitor:any) {
        return visitor.visitBlockStatement(this);
    }
}