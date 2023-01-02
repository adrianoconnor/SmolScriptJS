import { Token } from "../Token";
import { Expression } from "../Expressions/Expression";
import { Statement } from "./Statement";

export class VarStatement implements Statement {

    getStatementType() : string {
        return "Var";
    }   

    _name:Token;
    _expression:Expression;

    constructor(name:Token, expression:Expression) {
        this._name = name;
        this._expression = expression;
    }

    accept(visitor:any) {
        return visitor.visitVarStatement(this);
    }
}