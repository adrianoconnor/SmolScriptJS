import { AssignmentExpression } from "./Expressions/AssignmentExpression";
import { BinaryExpression } from "./Expressions/BinaryExpression";
import { GroupingExpression } from "./Expressions/GroupingExpression";
import { LiteralExpression } from "./Expressions/LiteralExpression";
import { VariableExpression } from "./Expressions/VariableExpression";
import { ExpressionStatement } from "./Statements/ExpressionStatement";
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
import { SmolEngine } from "./SmolEngine";
import { Statement } from "./Statements/Statement";

export class AstDebugPrinter {

    static parse(source:string) {
        let engine = new SmolEngine();
        let prog = engine.compile(source);
        let astPrinter = new AstDebugPrinter();

        for(var i = 0; i < prog.length; i++) {
            astPrinter.processStmt(prog[i]);    
        }
    }

    private constructor() {

    }

    private processStmt(stmt:Statement) {
        console.log(stmt.accept(this));   
    }

    private visitBlockStatement(stmt:BlockStatement) {
        var _this = this;
        return (`(block ${stmt._statements.forEach(function(x) { x.accept(_this); })})`);
    }

    private visitBreakStatement(stmt:BreakStatement) {
        return (`(break)`);
    }

    private visitExpressionStatement(stmt:ExpressionStatement) {
        return (`(exprStmt ${stmt._expression.accept(this)})`);
    }

    visitFunctionStatement(stmt:FunctionStatement) : string {

        var name = stmt._name as Token || "anonymous";

        return (`(declare function ${name.lexeme} with ${stmt._parameters.length} params [${stmt._parameters.map(function(p) { return p.lexeme; }).join(', ')}])`);
    }

    private visitIfStatement(stmt:IfStatement) {
        return (`(if ${stmt._expression.accept(this)} then ... else ...)`);
    }

    private visitPrintStatement(stmt:PrintStatement) {
        return (`(print ${stmt._expression.accept(this)})`);
    }

    private visitReturnStatement(stmt:ReturnStatement) {
        return (`(return ...)`);
    }

    private visitVarStatement(stmt:VarStatement) {
        return (`(declare var ${stmt._name.lexeme} = ${stmt._expression.accept(this)})`);
    }

    private visitWhileStatement(stmt:WhileStatement) {
        return (`(while ${stmt._expression.accept(this)} ...)`);
    }

    private visitAssignmentExpression(expr:AssignmentExpression) {
        return (`(assign var ${expr._name.lexeme} = ${expr._value.accept(this)})`);
    }

    private visitBinaryExpression(expr:BinaryExpression) {
        return (`(${expr._operand.lexeme} ${expr._left.accept(this)} ${expr._right.accept(this)})`);
    }

    private visitCallExpression(expr:CallExpression) {
        return (`(call ${expr._callee.accept(this)} with ${expr._args.length} args)`);
    }

    private visitGroupingExpression(expr:GroupingExpression) {
        return (`(group ${expr._expr.accept(this)})`);
    }

    private visitLiteralExpression(expr:LiteralExpression) {
        return (`${expr._value == null ? "nil" : expr._value.toString()}`);
    }

    private visitLogicalExpression(expr:LogicalExpression) {
        return (`(${expr._operand.lexeme} ${expr._left.accept(this)} ${expr._right.accept(this)})`);
    }

    private visitUnaryExpression(expr:UnaryExpression) {
        return (`(${expr._operand.lexeme} ${expr._right.accept(this)})`);
    }

    private visitVariableExpression(expr:VariableExpression) {
        return (`(var ${expr._name.lexeme})`);
    }
}