/* eslint-disable @typescript-eslint/no-explicit-any */
import { Statement } from "./Statement";

export class BlockStatement implements Statement {

    getStatementType() : string {
        return "Block";
    }

    statements:Statement[];
    isVirtual:boolean;

    constructor(statements:Statement[], isVirtual = false) {
        this.statements = statements;
        this.isVirtual = isVirtual;
    }

    accept(visitor:any) {
        return visitor.visitBlockStatement(this);
    }

    blockStartTokenIndex:number|undefined;
    blockEndTokenIndex:number|undefined;
}