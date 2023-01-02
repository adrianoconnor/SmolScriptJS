import { AssignmentExpression } from "./Expressions/AssignmentExpression";
import { BinaryExpression } from "./Expressions/BinaryExpression";
import { GroupingExpression } from "./Expressions/GroupingExpression";
import { LiteralExpression } from "./Expressions/LiteralExpression";
import { VariableExpression } from "./Expressions/VariableExpression";
import { ExpressionStatement } from "./Statements/ExpressionStatement";
import { Statement } from "./Statements/Statement";
import { VarStatement } from "./Statements/VarStatement";
import { PrintStatement } from "./Statements/PrintStatement";
import { CallExpression } from "./Expressions/CallExpression";
import { LogicalExpression } from "./Expressions/LogicalExpression";
import { UnaryExpression } from "./Expressions/UnaryExpression";
import { BlockStatement } from "./Statements/BlockStatement";
import { BreakStatement } from "./Statements/BreakStatement";
import { FunctionStatement } from "./Statements/FunctionStatement";
import { Token } from "./Token";
import { ReturnStatement } from "./Statements/ReturnStatement";
import { IfStatement } from "./Statements/IfStatement";
import { WhileStatement } from "./Statements/WhileStatement";

export class AstDebugPrinter {

    print(s:Statement) {
        console.log(s.accept(this));   
    }

    visitBlockStatement(stmt:BlockStatement) {
        var _this = this;
        return (`(block ${stmt._statements.forEach(function(x) { x.accept(_this); })})`);
    }

    visitBreakStatement(stmt:BreakStatement) {
        return (`(break)`);
    }

    visitExpressionStatement(stmt:ExpressionStatement) {
        return (`(exprStmt ${stmt._expression.accept(this)})`);
    }

    visitFunctionStatement(stmt:FunctionStatement) {

        var name = stmt._name as Token || "anonymouse";

        return (`(dedclare function ${name} ...)`);
    }

    visitIfStatement(stmt:IfStatement) {
        return (`(if ${stmt._expression.accept(this)} then ... else ...)`);
    }

    visitPrintStatement(stmt:PrintStatement) {
        return (`(print ${stmt._expression.accept(this)})`);
    }

    visitReturnStatement(stmt:ReturnStatement) {
        return (`(return ...)`);
    }

    visitVarStatement(stmt:VarStatement) {
        return (`(declare var ${stmt._name.lexeme} = ${stmt._expression.accept(this)})`);
    }

    visitWhileStatement(stmt:WhileStatement) {
        return (`(while ${stmt._expression.accept(this)} ...)`);
    }

    visitAssignmentExpression(expr:AssignmentExpression) {
        return (`(assign var ${expr._name.lexeme} = ${expr._value.accept(this)})`);
    }

    visitBinaryExpression(expr:BinaryExpression) {
        return (`(${expr._operand.lexeme} ${expr._left.accept(this)} ${expr._right.accept(this)})`);
    }

    visitCallExpression(expr:CallExpression) {
        return (`(call ${expr._callee.accept(this)} with ${expr._args.length} arg(s))`);
    }

    visitGroupingExpression(expr:GroupingExpression) {

        return (`(group ${expr._expr.accept(this)})`);
    }

    visitLiteralExpression(expr:LiteralExpression) {
        return (`${expr._value == null ? "nil" : expr._value.toString()}`);
    }

    visitLogicalExpression(expr:LogicalExpression) {
        return (`(${expr._operand.lexeme} ${expr._left.accept(this)} ${expr._right.accept(this)})`);
    }

    visitUnaryExpression(expr:UnaryExpression) {
        return (`(${expr._operand.lexeme} ${expr._right.accept(this)})`);
    }

    visitVariableExpression(expr:VariableExpression) {
        return (`(var ${expr._name.lexeme})`);
    }
}