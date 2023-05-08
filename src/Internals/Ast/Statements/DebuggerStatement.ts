import { Statement } from "./Statement";

export class DebuggerStatement implements Statement {

    getStatementType() : string {
        return "Debugger";
    }


    constructor() {

    }

    accept(visitor:any) {
        return visitor.visitDebuggerStatement(this);
    }
}