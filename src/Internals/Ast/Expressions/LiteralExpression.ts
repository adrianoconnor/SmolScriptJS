/* eslint-disable @typescript-eslint/no-explicit-any */
import { SmolVariableType } from "../../SmolVariableTypes/SmolVariableType";
import { Expression } from "./Expression";

export class LiteralExpression implements Expression {

    getExpressionType() : string {
        return "Literal";
    }

    value:SmolVariableType;

    constructor(value:SmolVariableType) {
        this.value = value;
    }

    accept(visitor:any) {
        return visitor.visitLiteralExpression(this);
    }
}