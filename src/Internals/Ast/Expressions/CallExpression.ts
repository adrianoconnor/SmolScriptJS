import { Expression } from "./Expression";

export class CallExpression implements Expression {

    getExpressionType() : string {
        return "Call";
    }

    callee:Expression;
    args:Expression[];
    useObjectRef:Boolean;

    constructor(callee:Expression, args:Expression[], useObjectRef:Boolean) {
        this.callee = callee;
        this.args = args;
        this.useObjectRef = useObjectRef;
    }

    accept(visitor:any) {
        return visitor.visitCallExpression(this);
    }
}