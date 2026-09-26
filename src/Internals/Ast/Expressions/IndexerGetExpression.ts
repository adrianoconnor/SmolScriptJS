import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";

export class IndexerGetExpression extends Expression {

    getExpressionType() : string {
        return "IndexerGet";
    }

    obj:Expression;
    indexerExpr:Expression;

    constructor(obj:Expression, indexerExpr:Expression) {
        super();
        this.obj = obj;
        this.indexerExpr = indexerExpr;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitIndexerGetExpression(this);
    }
}