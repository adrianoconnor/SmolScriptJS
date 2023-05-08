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
import { ReturnStatement } from "./Statements/ReturnStatement";
import { IfStatement } from "./Statements/IfStatement";
import { WhileStatement } from "./Statements/WhileStatement";
import { Statement } from "./Statements/Statement";
import { Scanner } from "../Scanner";
import { Parser } from "../Parser";
import { FunctionExpression } from "./Expressions/FunctionExpression";
import { ContinueStatement } from "./Statements/ContinueStatement";
import { DebuggerStatement } from "./Statements/DebuggerStatement";
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

    _indent:number = 0;

    private indent() : string {
        this._indent++;
        return ''.padEnd((this._indent - 1) * 2, ' ');
    }

    private outdent() {
        this._indent--;
    }

    static parse(source:string) : string {
        var t = Scanner.tokenize(source);
        var p = Parser.parse(t);

        let astPrinter = new AstDebugPrinter();

        var ast = '';

        for(var i = 0; i < p.length; i++) {
            ast += astPrinter.processStmt(p[i]);    
        }

        return ast;
    }

    private constructor() {

    }

    private processStmt(stmt:Statement) : string {
        return stmt.accept(this);
    }

    private visitBlockStatement(stmt:BlockStatement) {
        var i = this.indent();
        var rt = '';

        var _this = this;

        rt += `${i}[block]\n`;

        stmt._statements.forEach(function(x) 
        { 
            rt += x.accept(_this);
        });

        rt += `${i}[/block]\n`;

        this.outdent();

        return rt; 
    }

    private visitBreakStatement(stmt:BreakStatement) {
        var i = this.indent();
        var rt = '';

        rt = `${i}[break]\n`;

        this.outdent();
        return rt;
    }

    private visitClassStatement(stmt:ClassStatement) : string {

        var i = this.indent();
        var rt = '';
        var t = this;

        rt += `${i}[class name=${stmt._className}]\n`;
        var i2 = this.indent();
        stmt._functions.forEach(function(f, n) {
            rt += `${i}[classFunction name=${f._name.lexeme}]\n`;
            f._parameters.forEach(function(p, n2) {
                rt += `${i}  param ${n2}: ${p.lexeme}\n`;
            });
            rt += f._functionBody.accept(t);
            rt += `${i}[/classFunction]\n`;            
        });
        this.outdent();
        rt += `${i}[/class]\n`;
        
        this.outdent();
        return rt;
    }

    private visitContinueStatement(stmt:ContinueStatement) {
        var i = this.indent();
        var rt = '';

        rt = `${i}[continue]\n`;

        this.outdent();
        return rt;
    }

    private visitDebuggerStatement(stmt:DebuggerStatement) {
        var i = this.indent();
        var rt = '';

        rt = `${i}[debugger]\n`;

        this.outdent();
        return rt;
    }

    private visitExpressionStatement(stmt:ExpressionStatement) {
        var i = this.indent();
        var rt = '';

        rt += `${i}[exprStmt ${stmt._expression.accept(this)}]\n`;

        this.outdent();
        return rt;
    }
    
    private visitFunctionStatement(stmt:FunctionStatement) : string {

        var i = this.indent();
        var rt = '';

        rt += `${i}[function name=${stmt._name.lexeme}]\n`;
        stmt._parameters.forEach(function(p, n) {
            rt += `${i}  param ${n}: ${p.lexeme}\n`;
        });
        rt += stmt._functionBody.accept(this);
        rt += `${i}[/functionExpression]\n`;
        
        this.outdent();
        return rt;
    }
    

    private visitIfStatement(stmt:IfStatement) {
        var i = this.indent();
        var rt = '';

        rt += `${i}[if testExpr:${stmt._expression.accept(this)}]\n`;
        rt += stmt._thenStatement.accept(this);
        
        if (stmt._elseStatement != undefined) {
            rt += `${i}[else]\n`;
            rt += stmt._elseStatement.accept(this);
        }

        rt += `${i}[end if]\n`;

        this.outdent();

        return rt;
    }

    private visitPrintStatement(stmt:PrintStatement) : string {

        var i = this.indent();
        var rt = '';

        rt = `${i}[print expr:${stmt._expression.accept(this)}]\n`;

        this.outdent();

        return rt;
    }

    private visitReturnStatement(stmt:ReturnStatement) : string {
        
        var i = this.indent();
        var rt = '';

        if (stmt._expression == undefined) {
            rt = `${i}[return default(undefined)]\n`;
        }
        else {
            rt = `${i}[return expr:${stmt._expression.accept(this)}]\n`;
        }

        this.outdent();

        return rt;
    }

    private visitTryStatement(stmt:TryStatement) : string {

        var i = this.indent();
        var rt = '';

        rt += `${i}[try]\n`;
        rt += stmt._tryBody.accept(this);
        rt += `${i}[/try]\n`;
        
        if (stmt._catchBody != null) {
            if (stmt._exceptionVariableName != null) {
                rt = `${i}[catch exceptionVariable=${stmt._exceptionVariableName.lexeme}]\n`;
            }
            else {
                rt = `${i}[catch]\n`;
            }
            rt += stmt._catchBody.accept(this);
            rt = `${i}[/catch]\n`;
        }

        if (stmt._finallyBody != null) {
            rt = `${i}[finally]\n`;
            rt += stmt._finallyBody.accept(this);
            rt = `${i}[/finally]\n`;
        }

        this.outdent();
        return rt;
    }

    private visitThrowStatement(stmt:ThrowStatement) : string {

        var i = this.indent();
        var rt = '';

        if (stmt._expression != null) {
            rt = `${i}[throw expr:${stmt._expression.accept(this)}]\n`;
        }
        else {
            rt = `${i}[throw]\n`;
        }

        this.outdent();
        return rt;
    }

    private visitVarStatement(stmt:VarStatement) : string {

        var i = this.indent();
        var rt = '';

        if (stmt._initializerExpression != undefined) {
            rt += `${i}[declare var ${stmt._name.lexeme} initializer:${stmt._initializerExpression.accept(this)}]\n`;
        }
        else {
            rt = `${i}[declare var ${stmt._name.lexeme}]\n`;
        }

        this.outdent();
        return rt;
    }

    private visitWhileStatement(stmt:WhileStatement) : string {
        
        var i = this.indent();
        var rt = '';

        rt += `${i}[while expr:${stmt._whileCondition.accept(this)}]\n`;
        rt += stmt._executeStatement.accept(this);
        rt += `${i}[/while]\n`;

        this.outdent();
        return rt;
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

    private visitFunctionExpression(expr:FunctionExpression) : string {

        var i = this.indent();
        var rt = '';

        rt = `(functionExpression)\n`;
        rt += `${i}[functionExpression]\n`;
        expr._parameters.forEach(function(p, n) {
            rt += `${i}  param ${n}: ${p.lexeme}\n`;
        });
        rt += expr._functionBody.accept(this);
        rt += `${i}[/functionExpression]\n`;

        this.outdent();

        return rt;

        //return (`(function params: [${expr._parameters.map<string>(function (t) { return t.lexeme })}])`);
    }

    private visitGetExpression(expr:GetExpression) : string {
        return (`(get obj:${expr._obj.accept(this)} name:${expr._name.lexeme})`);
    }

    private visitGroupingExpression(expr:GroupingExpression) : string {
        return (`(group expr:${expr._expr.accept(this)})`);
    }

    private visitIndexerGetExpression(expr:IndexerGetExpression) : string {
        return (`(indexerGet obj:${expr._obj.accept(this)} property:${expr._obj.accept(this)})`);
    }
    
    private visitIndexerSetExpression(expr:IndexerSetExpression) : string {
        return (`(indexerSet obj:${expr._obj.accept(this)} property:${expr._obj.accept(this)} value:${expr._value.accept(this)})`);
    }

    private visitLiteralExpression(expr:LiteralExpression) : string {
        return (`(literal ${expr._value == null ? "nil" : expr._value.toString()})`);
    }

    private visitLogicalExpression(expr:LogicalExpression) : string {
        return (`(${expr._op.lexeme} ${expr._left.accept(this)} ${expr._right.accept(this)})`);
    }

    private visitNewInstance(expr:NewInstanceExpression) : string {
        return (`(new ${expr._className.lexeme} with ${expr._ctorArgs.length} args in ctor)`);
    }

    private visitObjectInitializer(expr:ObjectInitializerExpression) : string {
        return (`(initialize ${expr._name.lexeme} value:${expr._value.accept(this)})`);
    }

    private visitSetExpression(expr:SetExpression) : string {
        return (`(set obj:${expr._obj.accept(this)} name:${expr._name.lexeme} value:${expr._value.accept(this)})`);
    }

    private visitTernaryExpression(expr:TernaryExpression) : string {
        return (`(${expr._evaluationExpression.accept(this)} ? ${expr._expresisonIfTrue.accept(this)} : ${expr._expresisonIfFalse.accept(this)})`);
    }

    private visitUnaryExpression(expr:UnaryExpression) : string {
        return (`(${expr._op.lexeme} ${expr._right.accept(this)})`);
    }

    private visitVariableExpression(expr:VariableExpression) : string {
        return (`(var ${expr._name.lexeme})`);
    }
}