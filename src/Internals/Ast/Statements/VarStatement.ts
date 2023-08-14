/* eslint-disable @typescript-eslint/no-explicit-any */
import { Statement } from "./Statement";
import { Token } from "../../Token";
import { Expression } from "../Expressions/Expression";

export class VarStatement implements Statement {

    getStatementType() : string {
        return "Var";
    }

    name:Token;
    initializerExpression?:Expression;

    constructor(name:Token, initializerExpression:Expression|undefined) {
        this.name = name;
        this.initializerExpression = initializerExpression;
    }

    accept(visitor:any) {
        return visitor.visitVarStatement(this);
    }

    firstTokenIndex:number|undefined;
    lastTokenIndex:number|undefined;
}