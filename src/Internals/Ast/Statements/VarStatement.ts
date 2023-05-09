import { Statement } from "./Statement";
import { Token } from "../../Token";
import { Expression } from "../Expressions/Expression";

export class VarStatement implements Statement {

    getStatementType() : string {
        return "Var";
    }

    _name:Token;
    _initializerExpression?:Expression;

    constructor(name:Token, initializerExpression:Expression|undefined = undefined) {
        this._name = name;
        this._initializerExpression = initializerExpression;
    }
    
    accept(visitor:any) {
        return visitor.visitVarStatement(this);
    }
}