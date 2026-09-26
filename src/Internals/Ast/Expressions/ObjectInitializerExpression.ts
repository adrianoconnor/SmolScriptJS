import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";
import { Token } from "../../Token";

export class ObjectInitializerExpression extends Expression {

    getExpressionType() : string {
        return "ObjectInitializer";
    }

    name:Token;
    value:Expression;

    constructor(name:Token, value:Expression) {
        super();
        this.name = name;
        this.value = value;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitObjectInitializerExpression(this);
    }
}