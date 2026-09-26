import { Statement } from "./Statement";
import { StatementVisitor } from "./StatementVisitor";
import { Token } from "../../Token";
import { Expression } from "../Expressions/Expression";

export class VarStatement extends Statement {

    getStatementType() : string {
        return "Var";
    }

    name:Token;
    initializerExpression?:Expression;

    constructor(name:Token, initializerExpression:Expression|undefined) {
        super();
        this.name = name;
        this.initializerExpression = initializerExpression;
    }

    accept<R>(visitor: StatementVisitor<R>): R {
        return visitor.visitVarStatement(this);
    }

    firstTokenIndex:number|undefined;
    lastTokenIndex:number|undefined;
}