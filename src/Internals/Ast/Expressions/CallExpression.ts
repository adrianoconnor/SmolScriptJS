import { Expression } from "./Expression";

export class CallExpression implements Expression {

    getExpressionType() : string {
        return "Call";
    }

    _callee:Expression;
    _args:Expression[];
    _useObjectRef:Boolean;

    constructor(callee:Expression, args:Expression[], useObjectRef:Boolean) {
        this._callee = callee;
        this._args = args;
        this._useObjectRef = useObjectRef;
    }

    accept(visitor:any) {
        return visitor.visitCallExpression(this);
    }
}