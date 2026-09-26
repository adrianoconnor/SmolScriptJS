import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";
import { SmolVariableType } from "../../SmolVariableTypes/SmolVariableType";

export class LiteralExpression extends Expression {

    getExpressionType() : string {
        return "Literal";
    }

    value:SmolVariableType;

    constructor(value:SmolVariableType) {
        super();
        this.value = value;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitLiteralExpression(this);
    }
}