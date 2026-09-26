import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";
import { Token } from "../../Token";

export class GetExpression extends Expression {

    getExpressionType() : string {
        return "Get";
    }

    obj:Expression;
    name:Token;

    constructor(obj:Expression, name:Token) {
        super();
        this.obj = obj;
        this.name = name;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitGetExpression(this);
    }
}