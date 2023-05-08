import { Expression } from "./Expression";
import { Token } from "../../Token";

export class NewInstanceExpression implements Expression {

    getExpressionType() : string {
        return "NewInstance";
    }

    _className:Token;
    _ctorArgs:Expression[];

    constructor(className:Token, ctorArgs:Expression[]) {
        this._className = className;
        this._ctorArgs = ctorArgs;
    }

    accept(visitor:any) {
        return visitor.visitNewInstanceExpression(this);
    }
}