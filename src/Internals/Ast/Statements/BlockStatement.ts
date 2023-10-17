/* eslint-disable @typescript-eslint/no-explicit-any */
import { Statement } from "./Statement";

export class BlockStatement implements Statement {

    getStatementType() : string {
        return "Block";
    }

    statements:Statement[];
    insertedByParser:boolean; // Means it was inserted by the parser to support a scope that is required by convention butnot explicitly given

    constructor(statements:Statement[], isVirtual = false) {
        this.statements = statements;
        this.insertedByParser = isVirtual;
    }

    accept(visitor:any) {
        return visitor.visitBlockStatement(this);
    }

    blockStartTokenIndex:number|undefined;
    blockEndTokenIndex:number|undefined;
}