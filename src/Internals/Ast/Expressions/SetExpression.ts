import { Expression } from "./Expression";
import { Token } from "../../Token";

export class SetExpression implements Expression {

    getExpressionType() : string {
        return "Set";
    }

    obj:Expression;
    name:Token;
    value:Expression;

    constructor(obj:Expression, name:Token, value:Expression) {
        this.obj = obj;
        this.name = name;
        this.value = value;
    }

    accept(visitor:any) {
        return visitor.visitSetExpression(this);
    }
}