import { Expression } from "./Expression";
import { ExpressionVisitor } from "./ExpressionVisitor";
import { Token } from "../../Token";
import { BlockStatement } from "../Statements/BlockStatement";

export class FunctionExpression extends Expression {

    getExpressionType() : string {
        return "Function";
    }

    parameters:Token[];
    functionBody:BlockStatement;

    constructor(parameters:Token[], functionBody:BlockStatement) {
        super();
        this.parameters = parameters;
        this.functionBody = functionBody;
    }

    accept<R>(visitor: ExpressionVisitor<R>): R {
        return visitor.visitFunctionExpression(this);
    }
}