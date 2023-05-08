import { Expression } from "./Expression";

export class IndexerGetExpression implements Expression {

    getExpressionType() : string {
        return "IndexerGet";
    }

    _obj:Expression;
    _indexerExpr:Expression;

    constructor(obj:Expression, indexerExpr:Expression) {
        this._obj = obj;
        this._indexerExpr = indexerExpr;
    }

    accept(visitor:any) {
        return visitor.visitIndexerGetExpression(this);
    }
}