/* eslint-disable @typescript-eslint/no-explicit-any */
import { Expression } from "./Expression";
import { Token } from "../../Token";

export class GetExpression implements Expression {

    getExpressionType() : string {
        return "Get";
    }

    obj:Expression;
    name:Token;

    constructor(obj:Expression, name:Token) {
        this.obj = obj;
        this.name = name;
    }

    accept(visitor:any) {
        return visitor.visitGetExpression(this);
    }
}