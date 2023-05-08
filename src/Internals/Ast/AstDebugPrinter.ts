import { AssignExpression } from "./Expressions/AssignExpression";
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
import { Token } from "../Token";
import { ReturnStatement } from "./Statements/ReturnStatement";
import { IfStatement } from "./Statements/IfStatement";
import { WhileStatement } from "./Statements/WhileStatement";
import { Statement } from "./Statements/Statement";
import { Scanner } from "../Scanner";
import { Parser } from "../Parser";

export class AstDebugPrinter {

    static parse(source:string) {
        var t = Scanner.tokenize(source);
        var p = Parser.parse(t);

        let astPrinter = new AstDebugPrinter();

        for(var i = 0; i < p.length; i++) {
            astPrinter.processStmt(p[i]);    
        }
    }

    private constructor() {

    }

    private processStmt(stmt:Statement) {
        console.log(stmt.accept(this));   
    }

    private visitBlockStatement(stmt:BlockStatement) {
        var _this = this;

        var stmts = '';

        stmt._statements.forEach(function(x) 
        { 
            stmts += x.accept(_this);
        });

        return `(block ${stmts})`;
    }

    private visitBreakStatement(stmt:BreakStatement) {
        return (`(break)`);
    }

    private visitExpressionStatement(stmt:ExpressionStatement) {
        return (`(exprStmt ${stmt._expression.accept(this)})`);
    }

    /*
    private visitFunctionStatement(stmt:FunctionStatement) : string {

        var name = stmt._name as Token || "anonymous";

        return (`(declare function ${name.lexeme} with ${stmt._parameters.length} params [${stmt._parameters.map(function(p) { return p.lexeme; }).join(', ')}])`);
    }
    */

    private visitIfStatement(stmt:IfStatement) {
        var output : string[] = [];
        output.push(`[if ${stmt._expression.accept(this)}]`);
        output.push(stmt._thenStatement.accept(this));
        if (stmt._elseStatement != undefined) {
            output.push('[else]')
            output.push(stmt._elseStatement.accept(this));     
        }

        output.push('[end if]')
        return output.join('\n');
    }

    private visitPrintStatement(stmt:PrintStatement) : string {

        return (`(print ${stmt._expression.accept(this)})`);
    }

    private visitReturnStatement(stmt:ReturnStatement) : string {
        if (stmt._expression == undefined) {
            return (`(return)`);
        }
        else {
            return (`(return ${stmt._expression.accept(this)})`);
        }
    }

    private visitVarStatement(stmt:VarStatement) : string {

        return (`(declare var ${stmt._name.lexeme})`);// = ${stmt._initializerExpression != undefined ? stmt._initializerExpression.accept(this) : ''})`);
    }

    private visitWhileStatement(stmt:WhileStatement) : string {
        return (`(while ${stmt._executeStatement.accept(this)} ...)`);
    }

    private visitAssignExpression(expr:AssignExpression) : string {
        return (`(assign var ${expr._name.lexeme} = ${expr._value.accept(this)})`);
    }

    private visitBinaryExpression(expr:BinaryExpression) : string {
        return (`(${expr._op.lexeme} ${expr._left.accept(this)} ${expr._right.accept(this)})`);
    }

    private visitCallExpression(expr:CallExpression) : string {
        return (`(call ${expr._callee.accept(this)} with ${expr._args.length} args)`);
    }

    private visitGroupingExpression(expr:GroupingExpression) : string {
        return (`(group ${expr._expr.accept(this)})`);
    }

    private visitLiteralExpression(expr:LiteralExpression) : string {
        return (`${expr._value == null ? "nil" : expr._value.toString()}`);
    }

    private visitLogicalExpression(expr:LogicalExpression) : string {
        return (`(${expr._op.lexeme} ${expr._left.accept(this)} ${expr._right.accept(this)})`);
    }

    private visitUnaryExpression(expr:UnaryExpression) : string {
        return (`(${expr._op.lexeme} ${expr._right.accept(this)})`);
    }

    private visitVariableExpression(expr:VariableExpression) : string {
        return (`(var ${expr._name.lexeme})`);
    }
}