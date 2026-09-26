import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";
import { Token } from "../../Token";
import { TokenType } from "../../TokenType";

export class VariableExpression extends Expression {

    getExpressionType() : string {
        return "Variable";
    }

    name:Token;
    prepostfixOp?:TokenType;

    constructor(name:Token, prepostfixOp:TokenType|undefined) {
        super();
        this.name = name;
        this.prepostfixOp = prepostfixOp;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitVariableExpression(this);
    }
}