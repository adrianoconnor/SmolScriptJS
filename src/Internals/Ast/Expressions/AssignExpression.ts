import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";
import { Token } from "../../Token";

export class AssignExpression extends Expression {

    getExpressionType() : string {
        return "Assign";
    }

    name:Token;
    value:Expression;

    constructor(name:Token, value:Expression) {
        super()
        this.name = name;
        this.value = value;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitAssignExpression(this);
    }
}