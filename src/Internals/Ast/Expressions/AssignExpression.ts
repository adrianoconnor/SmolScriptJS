/* eslint-disable @typescript-eslint/no-explicit-any */
import { Expression } from "./Expression";
import { Token } from "../../Token";

export class AssignExpression implements Expression {

    getExpressionType() : string {
        return "Assign";
    }

    name:Token;
    value:Expression;

    constructor(name:Token, value:Expression) {
        this.name = name;
        this.value = value;
    }

    accept(visitor:any) {
        return visitor.visitAssignExpression(this);
    }
}