import { Expression } from "./Expression";

export class IndexerGetExpression implements Expression {

    getExpressionType() : string {
        return "IndexerGet";
    }

    obj:Expression;
    indexerExpr:Expression;

    constructor(obj:Expression, indexerExpr:Expression) {
        this.obj = obj;
        this.indexerExpr = indexerExpr;
    }

    accept(visitor:any) {
        return visitor.visitIndexerGetExpression(this);
    }
}