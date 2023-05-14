import { Expression } from "./Expression";

export class CallExpression implements Expression {

    getExpressionType() : string {
        return "Call";
    }

    callee:Expression;
    args:Expression[];
    useObjectRef:boolean;

    constructor(callee:Expression, args:Expression[], useObjectRef:boolean) {
        this.callee = callee;
        this.args = args;
        this.useObjectRef = useObjectRef;
    }

    accept(visitor:any) {
        return visitor.visitCallExpression(this);
    }
}