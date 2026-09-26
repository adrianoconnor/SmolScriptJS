import { Statement } from "./Statement";
import { StatementVisitor } from "./StatementVisitor";
import { Expression } from "../Expressions/Expression";

export class ThrowStatement extends Statement {

    getStatementType() : string {
        return "Throw";
    }

    expression:Expression;

    constructor(expression:Expression) {
        super();
        this.expression = expression;
    }

    accept<R>(visitor: StatementVisitor<R>): R {
        return visitor.visitThrowStatement(this);
    }
}