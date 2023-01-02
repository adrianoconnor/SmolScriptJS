import { Statement } from "./Statement";

export class BlockStatement implements Statement {

    _statements:Statement[];

    constructor(statements:Statement[]) {
        this._statements = statements;
    }

    accept(visitor:any) {
        return visitor.visitBlockStatement(this);
    }
}