import { BlockStatement } from "./BlockStatement";
import { BreakStatement } from "./BreakStatement";
import { ClassStatement } from "./ClassStatement";
import { ContinueStatement } from "./ContinueStatement";
import { DebuggerStatement } from "./DebuggerStatement";
import { ExpressionStatement } from "./ExpressionStatement";
import { FunctionStatement } from "./FunctionStatement";
import { IfStatement } from "./IfStatement";
import { PrintStatement } from "./PrintStatement";
import { ReturnStatement } from "./ReturnStatement";
import { ThrowStatement } from "./ThrowStatement";
import { TryStatement } from "./TryStatement";
import { VarStatement } from "./VarStatement";
import { WhileStatement } from "./WhileStatement";

export interface StatementVisitor<R> {
    visitBlockStatement(stmt: BlockStatement): R;
    visitBreakStatement(stmt: BreakStatement): R;
    visitClassStatement(stmt: ClassStatement): R;
    visitContinueStatement(stmt: ContinueStatement): R;
    visitDebuggerStatement(stmt: DebuggerStatement): R;
    visitExpressionStatement(stmt: ExpressionStatement): R;
    visitFunctionStatement(stmt: FunctionStatement): R;
    visitIfStatement(stmt: IfStatement): R;
    visitPrintStatement(stmt: PrintStatement): R;
    visitReturnStatement(stmt: ReturnStatement): R;
    visitThrowStatement(stmt: ThrowStatement): R;
    visitTryStatement(stmt: TryStatement): R;
    visitVarStatement(stmt: VarStatement): R;
    visitWhileStatement(stmt: WhileStatement): R;
}