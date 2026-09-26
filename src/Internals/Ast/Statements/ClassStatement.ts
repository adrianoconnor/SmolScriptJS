import { Statement } from "./Statement";
import { StatementVisitor } from "./StatementVisitor";
import { Token } from "../../Token";
import {FunctionStatement} from "./FunctionStatement";

export class ClassStatement extends Statement {

    getStatementType() : string {
        return "Class";
    }

    className:Token;
    superclassName?:Token;
    functions:FunctionStatement[];

    constructor(className:Token, superclassName:Token|undefined, functions:FunctionStatement[]) {
        super();
        this.className = className;
        this.superclassName = superclassName;
        this.functions = functions;
    }

    accept<R>(visitor: StatementVisitor<R>): R {
        return visitor.visitClassStatement(this);
    }
}