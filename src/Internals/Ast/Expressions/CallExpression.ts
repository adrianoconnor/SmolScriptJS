import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";

export class CallExpression extends Expression {

    getExpressionType() : string {
        return "Call";
    }

    callee:Expression;
    args:Expression[];
    useObjectRef:boolean;

    constructor(callee:Expression, args:Expression[], useObjectRef:boolean) {
        super();
        this.callee = callee;
        this.args = args;
        this.useObjectRef = useObjectRef;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitCallExpression(this);
    }
}