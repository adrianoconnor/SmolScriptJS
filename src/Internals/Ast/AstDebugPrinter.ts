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
import { FunctionStatement } from "./Statements/FunctionStatement";
import { ReturnStatement } from "./Statements/ReturnStatement";
import { IfStatement } from "./Statements/IfStatement";
import { WhileStatement } from "./Statements/WhileStatement";
import { Statement } from "./Statements/Statement";
import { Scanner } from "../Scanner";
import { Parser } from "../Parser";
import { FunctionExpression } from "./Expressions/FunctionExpression";
import { ClassStatement } from "./Statements/ClassStatement";
import { ThrowStatement } from "./Statements/ThrowStatement";
import { TryStatement } from "./Statements/TryStatement";
import { GetExpression } from "./Expressions/GetExpression";
import { IndexerGetExpression } from "./Expressions/IndexerGetExpression";
import { IndexerSetExpression } from "./Expressions/IndexerSetExpression";
import { NewInstanceExpression } from "./Expressions/NewInstanceExpression";
import { ObjectInitializerExpression } from "./Expressions/ObjectInitializerExpression";
import { SetExpression } from "./Expressions/SetExpression";
import { TernaryExpression } from "./Expressions/TernaryExpression";

export class AstDebugPrinter {

    _indent = 0;

    private indent() : string {
        this._indent++;
        return ''.padEnd((this._indent - 1) * 2, ' ');
    }

    private outdent() {
        this._indent--;
    }

    static parse(source:string) : string {
        const t = Scanner.tokenize(source);
        const p = Parser.parse(t);

        const astPrinter = new AstDebugPrinter();

        let ast = '';

        for(let i = 0; i < p.length; i++) {
            ast += astPrinter.processStmt(p[i]);    
        }

        return ast;
    }

    private processStmt(stmt:Statement) : string {
        return stmt.accept(this);
    }

    private visitBlockStatement(stmt:BlockStatement) {
        const i = this.indent();
        let rt = '';

        rt += `${i}[block]\n`;

        stmt.statements.forEach((x) =>
        { 
            rt += x.accept(this);
        });

        rt += `${i}[/block]\n`;

        this.outdent();

        return rt; 
    }

    // Break, continue and debug can receive their stmt objects, but they don't use them and ununsed
    // vars are an eslint error so they aren't declared.
    private visitBreakStatement() {
        const i = this.indent();
        let rt = '';

        rt = `${i}[break]\n`;

        this.outdent();
        return rt;
    }

    private visitClassStatement(stmt:ClassStatement) : string {

        const i = this.indent();
        let rt = '';

        rt += `${i}[class name=${stmt.className}]\n`;
        const i2 = this.indent();
        stmt.functions.forEach((f) => {
            rt += `${i2}[classFunction name=${f.name.lexeme}]\n`;
            f.parameters.forEach((p, n2) => {
                rt += `${i2}  param ${n2}: ${p.lexeme}\n`;
            });
            rt += f.functionBody.accept(this);
            rt += `${i2}[/classFunction]\n`;            
        });
        this.outdent();
        rt += `${i}[/class]\n`;
        
        this.outdent();
        return rt;
    }

    private visitContinueStatement() {
        const i = this.indent();
        let rt = '';

        rt = `${i}[continue]\n`;

        this.outdent();
        return rt;
    }

    private visitDebuggerStatement() {
        const i = this.indent();
        let rt = '';

        rt = `${i}[debugger]\n`;

        this.outdent();
        return rt;
    }

    private visitExpressionStatement(stmt:ExpressionStatement) {
        const i = this.indent();
        let rt = '';

        rt += `${i}[exprStmt ${stmt.expression.accept(this)}]\n`;

        this.outdent();
        return rt;
    }
    
    private visitFunctionStatement(stmt:FunctionStatement) : string {

        const i = this.indent();
        let rt = '';

        rt += `${i}[function name=${stmt.name.lexeme}]\n`;
        stmt.parameters.forEach(function(p, n) {
            rt += `${i}  param ${n}: ${p.lexeme}\n`;
        });
        rt += stmt.functionBody.accept(this);
        rt += `${i}[/functionExpression]\n`;
        
        this.outdent();
        return rt;
    }
    

    private visitIfStatement(stmt:IfStatement) {
        const i = this.indent();
        let rt = '';

        rt += `${i}[if testExpr:${stmt.expression.accept(this)}]\n`;
        rt += stmt.thenStatement.accept(this);
        
        if (stmt.elseStatement != undefined) {
            rt += `${i}[else]\n`;
            rt += stmt.elseStatement.accept(this);
        }

        rt += `${i}[end if]\n`;

        this.outdent();

        return rt;
    }

    private visitPrintStatement(stmt:PrintStatement) : string {

        const i = this.indent();
        let rt = '';

        rt = `${i}[print expr:${stmt.expression.accept(this)}]\n`;

        this.outdent();

        return rt;
    }

    private visitReturnStatement(stmt:ReturnStatement) : string {
        
        const i = this.indent();
        let rt = '';

        if (stmt.expression == undefined) {
            rt = `${i}[return default(undefined)]\n`;
        }
        else {
            rt = `${i}[return expr:${stmt.expression.accept(this)}]\n`;
        }

        this.outdent();

        return rt;
    }

    private visitTryStatement(stmt:TryStatement) : string {

        const i = this.indent();
        let rt = '';

        rt += `${i}[try]\n`;
        rt += stmt.tryBody.accept(this);
        rt += `${i}[/try]\n`;
        
        if (stmt.catchBody != null) {
            if (stmt.exceptionVariableName != null) {
                rt = `${i}[catch exceptionletiable=${stmt.exceptionVariableName.lexeme}]\n`;
            }
            else {
                rt = `${i}[catch]\n`;
            }
            rt += stmt.catchBody.accept(this);
            rt = `${i}[/catch]\n`;
        }

        if (stmt.finallyBody != null) {
            rt = `${i}[finally]\n`;
            rt += stmt.finallyBody.accept(this);
            rt = `${i}[/finally]\n`;
        }

        this.outdent();
        return rt;
    }

    private visitThrowStatement(stmt:ThrowStatement) : string {

        const i = this.indent();
        let rt = '';

        if (stmt.expression != null) {
            rt = `${i}[throw expr:${stmt.expression.accept(this)}]\n`;
        }
        else {
            rt = `${i}[throw]\n`;
        }

        this.outdent();
        return rt;
    }

    private visitVarStatement(stmt:VarStatement) : string {

        const i = this.indent();
        let rt = '';

        if (stmt.initializerExpression != undefined) {
            rt += `${i}[declare var ${stmt.name.lexeme} initializer:${stmt.initializerExpression.accept(this)}]\n`;
        }
        else {
            rt = `${i}[declare var ${stmt.name.lexeme}]\n`;
        }

        this.outdent();
        return rt;
    }

    private visitWhileStatement(stmt:WhileStatement) : string {
        
        const i = this.indent();
        let rt = '';

        rt += `${i}[while expr:${stmt.whileCondition.accept(this)}]\n`;
        rt += stmt.executeStatement.accept(this);
        rt += `${i}[/while]\n`;

        this.outdent();
        return rt;
    }


    private visitAssignExpression(expr:AssignExpression) : string {
        return (`(assign var ${expr.name.lexeme} = ${expr.value.accept(this)})`);
    }

    private visitBinaryExpression(expr:BinaryExpression) : string {
        return (`(${expr.op.lexeme} ${expr.left.accept(this)} ${expr.right.accept(this)})`);
    }

    private visitCallExpression(expr:CallExpression) : string {
        return (`(call ${expr.callee.accept(this)} with ${expr.args.length} args)`);
    }

    private visitFunctionExpression(expr:FunctionExpression) : string {

        const i = this.indent();
        let rt = '';

        rt = `(functionExpression)\n`;
        rt += `${i}[functionExpression]\n`;
        expr.parameters.forEach(function(p, n) {
            rt += `${i}  param ${n}: ${p.lexeme}\n`;
        });
        rt += expr.functionBody.accept(this);
        rt += `${i}[/functionExpression]\n`;

        this.outdent();

        return rt;

        //return (`(function params: [${expr.parameters.map<string>(function (t) { return t.lexeme })}])`);
    }

    private visitGetExpression(expr:GetExpression) : string {
        return (`(get obj:${expr.obj.accept(this)} name:${expr.name.lexeme})`);
    }

    private visitGroupingExpression(expr:GroupingExpression) : string {
        return (`(group expr:${expr.expr.accept(this)})`);
    }

    private visitIndexerGetExpression(expr:IndexerGetExpression) : string {
        return (`(indexerGet obj:${expr.obj.accept(this)} property:${expr.obj.accept(this)})`);
    }
    
    private visitIndexerSetExpression(expr:IndexerSetExpression) : string {
        return (`(indexerSet obj:${expr.obj.accept(this)} property:${expr.obj.accept(this)} value:${expr.value.accept(this)})`);
    }

    private visitLiteralExpression(expr:LiteralExpression) : string {
        return (`(literal ${expr.value == null ? "nil" : expr.value.toString()})`);
    }

    private visitLogicalExpression(expr:LogicalExpression) : string {
        return (`(${expr.op.lexeme} ${expr.left.accept(this)} ${expr.right.accept(this)})`);
    }

    private visitNewInstanceExpression(expr:NewInstanceExpression) : string {
        return (`(new ${expr.className.lexeme} with ${expr.ctorArgs.length} args in ctor)`);
    }

    private visitObjectInitializerExpression(expr:ObjectInitializerExpression) : string {
        return (`(initialize ${expr.name.lexeme} value:${expr.value.accept(this)})`);
    }

    private visitSetExpression(expr:SetExpression) : string {
        return (`(set obj:${expr.obj.accept(this)} name:${expr.name.lexeme} value:${expr.value.accept(this)})`);
    }

    private visitTernaryExpression(expr:TernaryExpression) : string {
        return (`(${expr.evaluationExpression.accept(this)} ? ${expr.expresisonIfTrue.accept(this)} : ${expr.expresisonIfFalse.accept(this)})`);
    }

    private visitUnaryExpression(expr:UnaryExpression) : string {
        return (`(${expr.op.lexeme} ${expr.right.accept(this)})`);
    }

    private visitVariableExpression(expr:VariableExpression) : string {
        return (`(var ${expr.name.lexeme})`);
    }
}