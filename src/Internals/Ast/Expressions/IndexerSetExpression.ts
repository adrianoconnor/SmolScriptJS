import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";

export class IndexerSetExpression extends Expression {

    getExpressionType() : string {
        return "IndexerSet";
    }

    obj:Expression;
    indexerExpr:Expression;
    value:Expression;

    constructor(obj:Expression, indexerExpr:Expression, value:Expression) {
        super();
        this.obj = obj;
        this.indexerExpr = indexerExpr;
        this.value = value;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitIndexerSetExpression(this);
    }
}