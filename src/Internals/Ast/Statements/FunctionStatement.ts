import { Statement } from "./Statement";
import { StatementVisitor } from "./StatementVisitor";
import { Token } from "../../Token";
import {BlockStatement} from "./BlockStatement";

export class FunctionStatement extends Statement {

    getStatementType() : string {
        return "Function";
    }

    name:Token;
    parameters:Token[];
    functionBody:BlockStatement;

    constructor(name:Token, parameters:Token[], functionBody:BlockStatement) {
        super();
        this.name = name;
        this.parameters = parameters;
        this.functionBody = functionBody;
    }

    accept<R>(visitor: StatementVisitor<R>): R {
        return visitor.visitFunctionStatement(this);
    }
}