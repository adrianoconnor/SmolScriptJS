import { Statement } from "./Statement";
import { Token } from "../../Token";
import {FunctionStatement} from "./FunctionStatement";

export class ClassStatement implements Statement {

    getStatementType() : string {
        return "Class";
    }

    className:Token;
    superclassName?:Token;
    functions:FunctionStatement[];

    constructor(className:Token, superclassName:Token|undefined, functions:FunctionStatement[]) {
        this.className = className;
        this.superclassName = superclassName;
        this.functions = functions;
    }

    accept(visitor:any) {
        return visitor.visitClassStatement(this);
    }
}