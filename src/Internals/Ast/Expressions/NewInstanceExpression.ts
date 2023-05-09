import { Expression } from "./Expression";
import { Token } from "../../Token";

export class NewInstanceExpression implements Expression {

    getExpressionType() : string {
        return "NewInstance";
    }

    className:Token;
    ctorArgs:Expression[];

    constructor(className:Token, ctorArgs:Expression[]) {
        this.className = className;
        this.ctorArgs = ctorArgs;
    }

    accept(visitor:any) {
        return visitor.visitNewInstanceExpression(this);
    }
}