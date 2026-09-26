import { StatementVisitor } from "./StatementVisitor";

export abstract class Statement {

    getStatementType() : string {
        throw new Error("Should not be called on base");
    }
    
    abstract accept<R>(visitor: StatementVisitor<R>): R;
}
