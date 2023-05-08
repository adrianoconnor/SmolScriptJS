import { Statement } from "./Statement";

export class ContinueStatement implements Statement {

    getStatementType() : string {
        return "Continue";
    }


    constructor() {

    }

    accept(visitor:any) {
        return visitor.visitContinueStatement(this);
    }
}