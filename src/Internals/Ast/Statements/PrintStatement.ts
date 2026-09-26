import { Statement } from "./Statement";
import { StatementVisitor } from "./StatementVisitor";
import { Expression } from "../Expressions/Expression";

export class PrintStatement extends Statement {

    getStatementType() : string {
        return "Print";
    }

    expression:Expression;

    constructor(expression:Expression) {
        super();
        this.expression = expression;
    }

    accept<R>(visitor: StatementVisitor<R>): R {
        return visitor.visitPrintStatement(this);
    }
}