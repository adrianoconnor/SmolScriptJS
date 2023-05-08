import { Expression } from "./Expression";

export class TernaryExpression implements Expression {

    getExpressionType() : string {
        return "Ternary";
    }

    _evaluationExpression:Expression;
    _expresisonIfTrue:Expression;
    _expresisonIfFalse:Expression;

    constructor(evaluationExpression:Expression, expresisonIfTrue:Expression, expresisonIfFalse:Expression) {
        this._evaluationExpression = evaluationExpression;
        this._expresisonIfTrue = expresisonIfTrue;
        this._expresisonIfFalse = expresisonIfFalse;
    }

    accept(visitor:any) {
        return visitor.visitTernaryExpression(this);
    }
}