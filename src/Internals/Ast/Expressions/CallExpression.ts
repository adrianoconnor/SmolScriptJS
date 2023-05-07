import { Token } from "../../Token";
import { Expression } from "./Expression";

export class CallExpression extends Expression {

    _callee:Expression;
    _paren:Token;
    _args:any[];

    constructor(callee:Expression, paren:Token, args:any[]) {
        super();

        this._callee = callee;
        this._paren = paren;
        this._args = args;
    }

    accept(visitor:any) {
        return visitor.visitCallExpression(this);
    }
}