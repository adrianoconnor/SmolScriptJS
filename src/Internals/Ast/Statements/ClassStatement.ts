import { Statement } from "./Statement";
import { Token } from "../../Token";
import {FunctionStatement} from "./FunctionStatement";

export class ClassStatement implements Statement {

    getStatementType() : string {
        return "Class";
    }
    
    _className:Token;
    _superclassName?:Token;
    _functions:FunctionStatement[];

    constructor(className:Token, superclassName:Token|undefined, functions:FunctionStatement[]) {
        this._className = className;
        this._superclassName = superclassName;
        this._functions = functions;
    }

    accept(visitor:any) {
        return visitor.visitClassStatement(this);
    }
}