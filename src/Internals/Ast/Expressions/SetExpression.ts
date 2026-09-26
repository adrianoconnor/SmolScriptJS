import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";
import { Token } from "../../Token";

export class SetExpression extends Expression {

    getExpressionType() : string {
        return "Set";
    }

    obj:Expression;
    name:Token;
    value:Expression;

    constructor(obj:Expression, name:Token, value:Expression) {
        super();
        this.obj = obj;
        this.name = name;
        this.value = value;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitSetExpression(this);
    }
}