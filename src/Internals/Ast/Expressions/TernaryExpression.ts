/* eslint-disable @typescript-eslint/no-explicit-any */
import { Expression } from "./Expression";

export class TernaryExpression implements Expression {

    getExpressionType() : string {
        return "Ternary";
    }

    evaluationExpression:Expression;
    expresisonIfTrue:Expression;
    expresisonIfFalse:Expression;

    constructor(evaluationExpression:Expression, expresisonIfTrue:Expression, expresisonIfFalse:Expression) {
        this.evaluationExpression = evaluationExpression;
        this.expresisonIfTrue = expresisonIfTrue;
        this.expresisonIfFalse = expresisonIfFalse;
    }

    accept(visitor:any) {
        return visitor.visitTernaryExpression(this);
    }
}