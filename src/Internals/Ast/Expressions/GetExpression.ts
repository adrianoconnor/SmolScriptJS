import { Expression } from "./Expression";
import { Token } from "../../Token";

export class GetExpression implements Expression {

    getExpressionType() : string {
        return "Get";
    }

    _obj:Expression;
    _name:Token;

    constructor(obj:Expression, name:Token) {
        this._obj = obj;
        this._name = name;
    }

    accept(visitor:any) {
        return visitor.visitGetExpression(this);
    }
}