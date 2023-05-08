import { Expression } from "./Expression";

export class IndexerSetExpression implements Expression {

    getExpressionType() : string {
        return "IndexerSet";
    }

    _obj:Expression;
    _indexerExpr:Expression;
    _value:Expression;

    constructor(obj:Expression, indexerExpr:Expression, value:Expression) {
        this._obj = obj;
        this._indexerExpr = indexerExpr;
        this._value = value;
    }

    accept(visitor:any) {
        return visitor.visitIndexerSetExpression(this);
    }
}