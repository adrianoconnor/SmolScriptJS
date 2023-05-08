import { Expression } from "./Expression";
import { Token } from "../../Token";
import { TokenType } from "../../TokenType";

export class VariableExpression implements Expression {

    getExpressionType() : string {
        return "Variable";
    }

    _name:Token;
    _prepostfixOp?:TokenType;

    constructor(name:Token, prepostfixOp:any) {
        this._name = name;
        this._prepostfixOp = prepostfixOp;
    }

    accept(visitor:any) {
        return visitor.visitVariableExpression(this);
    }
}