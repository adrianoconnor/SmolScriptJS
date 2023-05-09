import { Expression } from "./Expression";
import { Token } from "../../Token";

export class ObjectInitializerExpression implements Expression {

    getExpressionType() : string {
        return "ObjectInitializer";
    }

    name:Token;
    value:Expression;

    constructor(name:Token, value:Expression) {
        this.name = name;
        this.value = value;
    }

    accept(visitor:any) {
        return visitor.visitObjectInitializerExpression(this);
    }
}