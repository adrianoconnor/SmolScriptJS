import { ExpressionVisitor } from "./ExpressionVisitor";

export abstract class Expression {

    abstract accept<R>(visitor: ExpressionVisitor<R>): R;
}