import { AssignExpression } from "./AssignExpression";
import { BinaryExpression } from "./BinaryExpression";
import { CallExpression } from "./CallExpression";
import { FunctionExpression } from "./FunctionExpression";
import { GetExpression } from "./GetExpression";
import { GroupingExpression } from "./GroupingExpression";
import { IndexerGetExpression } from "./IndexerGetExpression";
import { IndexerSetExpression } from "./IndexerSetExpression";
import { LiteralExpression } from "./LiteralExpression";
import { LogicalExpression } from "./LogicalExpression";
import { NewInstanceExpression } from "./NewInstanceExpression";
import { ObjectInitializerExpression } from "./ObjectInitializerExpression";
import { SetExpression } from "./SetExpression";
import { TernaryExpression } from "./TernaryExpression";
import { UnaryExpression } from "./UnaryExpression";
import { VariableExpression } from "./VariableExpression";

export interface ExpressionVisitor<R> {
    visitAssignExpression(expr: AssignExpression): R;
    visitBinaryExpression(expr: BinaryExpression): R;
    visitCallExpression(expr: CallExpression): R;
    visitFunctionExpression(expr: FunctionExpression): R;
    visitGetExpression(expr: GetExpression): R;
    visitGroupingExpression(expr: GroupingExpression): R;
    visitIndexerGetExpression(expr: IndexerGetExpression): R;
    visitIndexerSetExpression(expr: IndexerSetExpression): R;
    visitLiteralExpression(expr: LiteralExpression): R;
    visitLogicalExpression(expr: LogicalExpression): R;
    visitNewInstanceExpression(expr: NewInstanceExpression): R;
    visitObjectInitializerExpression(expr: ObjectInitializerExpression): R;
    visitSetExpression(expr: SetExpression): R;
    visitTernaryExpression(expr: TernaryExpression): R;
    visitUnaryExpression(expr: UnaryExpression): R;
    visitVariableExpression(expr: VariableExpression): R;
}
 