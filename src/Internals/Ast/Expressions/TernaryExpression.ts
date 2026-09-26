import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";

export class TernaryExpression extends Expression {

    getExpressionType() : string {
        return "Ternary";
    }

    evaluationExpression:Expression;
    expresisonIfTrue:Expression;
    expresisonIfFalse:Expression;

    constructor(evaluationExpression:Expression, expresisonIfTrue:Expression, expresisonIfFalse:Expression) {
        super();
        this.evaluationExpression = evaluationExpression;
        this.expresisonIfTrue = expresisonIfTrue;
        this.expresisonIfFalse = expresisonIfFalse;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitTernaryExpression(this);
    }
}