import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";
import { Token } from "../../Token";

export class NewInstanceExpression extends Expression {

    getExpressionType() : string {
        return "NewInstance";
    }

    className:Token;
    ctorArgs:Expression[];

    constructor(className:Token, ctorArgs:Expression[]) {
        super();
        this.className = className;
        this.ctorArgs = ctorArgs;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitNewInstanceExpression(this);
    }
}