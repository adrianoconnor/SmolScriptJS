import { Statement } from "./Statement";
import { StatementVisitor } from "./StatementVisitor";
import { Expression } from "../Expressions/Expression";

export class ExpressionStatement extends Statement {
    
    firstTokenIndex:number|undefined;
    lastTokenIndex:number|undefined;

    getStatementType() : string {
        return "Expression";
    }

    expression:Expression;

    constructor(expression:Expression) {
        super();
        this.expression = expression;
    }

    accept<R>(visitor: StatementVisitor<R>): R {
        return visitor.visitExpressionStatement(this);
    }
}