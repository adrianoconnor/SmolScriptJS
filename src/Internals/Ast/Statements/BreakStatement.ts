import { Statement } from "./Statement";

export class BreakStatement implements Statement {

    getStatementType() : string {
        return "Break";
    }   

    constructor() {
    }

    accept(visitor:any) {
        return visitor.visitBreakStatement(this);
    }
}