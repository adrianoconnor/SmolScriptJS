/* eslint-disable @typescript-eslint/no-explicit-any */
import { Expression } from "./Expression";

export class IndexerSetExpression implements Expression {

    getExpressionType() : string {
        return "IndexerSet";
    }

    obj:Expression;
    indexerExpr:Expression;
    value:Expression;

    constructor(obj:Expression, indexerExpr:Expression, value:Expression) {
        this.obj = obj;
        this.indexerExpr = indexerExpr;
        this.value = value;
    }

    accept(visitor:any) {
        return visitor.visitIndexerSetExpression(this);
    }
}