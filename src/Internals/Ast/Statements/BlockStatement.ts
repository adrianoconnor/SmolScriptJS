import { Statement } from "./Statement";

export class BlockStatement implements Statement {

    getStatementType() : string {
        return "Block";
    }

    _statements:Statement[];

    constructor(statements:Statement[]) {
        this._statements = statements;
    }

    accept(visitor:any) {
        return visitor.visitBlockStatement(this);
    }
}