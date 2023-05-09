import { Expression } from "./Expression";
import { Token } from "../../Token";
import { TokenType } from "../../TokenType";

export class VariableExpression implements Expression {

    getExpressionType() : string {
        return "Variable";
    }

    name:Token;
    prepostfixOp?:TokenType;

    constructor(name:Token, prepostfixOp:TokenType|undefined) {
        this.name = name;
        this.prepostfixOp = prepostfixOp;
    }

    accept(visitor:any) {
        return visitor.visitVariableExpression(this);
    }
}