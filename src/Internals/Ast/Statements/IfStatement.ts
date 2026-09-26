import { Statement } from "./Statement";
import { StatementVisitor } from "./StatementVisitor";
import { Expression } from "../Expressions/Expression";

export class IfStatement extends Statement {

    getStatementType() : string {
        return "If";
    }

    expression:Expression;
    thenStatement:Statement;
    elseStatement?:Statement;

    constructor(expression:Expression, thenStatement:Statement, elseStatement:Statement|undefined) {
        super();
        this.expression = expression;
        this.thenStatement = thenStatement;
        this.elseStatement = elseStatement;
    }

    accept<R>(visitor: StatementVisitor<R>): R {
        return visitor.visitIfStatement(this);
    }

    // For source mapping

    exprFirstTokenIndex:number|undefined;
    exprLastTokenIndex:number|undefined;
    thenFirstTokenIndex:number|undefined;
    thenLastTokenIndex:number|undefined;
    elseFirstTokenIndex:number|undefined;
    elseLastTokenIndex:number|undefined;
}