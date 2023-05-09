import { Expression } from "./Expression";

export class LiteralExpression implements Expression {

    getExpressionType() : string {
        return "Literal";
    }

    value:any;

    constructor(value:any) {
        this.value = value;
    }

    accept(visitor:any) {
        return visitor.visitLiteralExpression(this);
    }
}