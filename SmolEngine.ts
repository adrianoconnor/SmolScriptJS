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
import { Expression } from "./Expressions/Expression";
import { TokenType } from "./TokenType";
import { Enviornment } from "./Environment";
import { ICallable, ReturnFromFunction, UserDefinedFunction } from "./UserDefinedFunction";
import { Scanner } from "./Scanner";
import { Parser } from "./Parser";

export class SignalBreakFromLoop extends Error {}

export class SmolEngine {

    private _env:Enviornment = new Enviornment();

    public compile(programme:string) : Statement[] {
        return Parser.parse(Scanner.tokenize(programme));
    }

    public execute(programme:Statement[]) {
        this.executeStatements(programme);
    }

    private executeStatements(statements:Statement[]) {
        for(var i = 0; i < statements.length; i++) {
            this.executeStatement(statements[i]);
        }
    }

    public executeStatement(stmt:Statement) {
        var result = stmt.accept(this);
    }

    public executeBlock(stmts:Statement[], env:Enviornment) {
        let originalEnv = this._env;
        this._env = env;
        try {        
            for (var i = 0; i < stmts.length; i++) {
                stmts[i].accept(this);
            }
        }
        finally {
            this._env = originalEnv;
        }
    }

    private evaluate(expr:Expression)
    {
        return expr.accept(this);
    }

    private isTruthy(value:any) {
        if (value == null || value == undefined) return false;
        if (value as Boolean != null) return value as Boolean;
        return true;
    }

    private areEqual(a:any, b:any) {
        if ((a == null || a == undefined) && (b == null || b == undefined)) return true;
        if ((a == null || a == undefined) || (b == null || b == undefined)) return false;
        //return a == b; // JS danger!
        return a.equals(b);
    }

    private stringify(value:any) {
        
        if (value == null || value == undefined) return "nil";

        if (value as string != null) return value as string;

        return value;
    }

    private visitBlockStatement(stmt:BlockStatement) {
        this.executeBlock(stmt._statements, new Enviornment(this._env));
    }

    private visitBreakStatement(stmt:BreakStatement) {
        throw new SignalBreakFromLoop();
    }

    private visitExpressionStatement(stmt:ExpressionStatement) {
        return this.evaluate(stmt._expression);
    }

    private visitFunctionStatement(stmt:FunctionStatement) {
        
        if (stmt._name as Token != null) {
            this._env.define((stmt._name as Token).lexeme, new UserDefinedFunction(stmt, this._env));
        }
        else {
            throw new Error("Anonymouse functions not allowed here");
        }
    }

    private visitIfStatement(stmt:IfStatement) {
        if (this.isTruthy(this.evaluate(stmt._expression))) {
            this.executeStatement(stmt._thenStatement);
        }
        else if (stmt._elseStatement != undefined) {
            this.executeStatement(stmt._elseStatement);
        }
    }

    private visitPrintStatement(stmt:PrintStatement) {
        console.log(this.stringify(this.evaluate(stmt._expression)));
    }

    private visitReturnStatement(stmt:ReturnStatement) {
        if (stmt._expression != undefined) {
            throw new ReturnFromFunction(this.evaluate(stmt._expression));
        }
        else {
            throw new ReturnFromFunction();
        }
    }

    private visitVarStatement(stmt:VarStatement) {
        this._env.define(stmt._name.lexeme, this.evaluate(stmt._expression));
    }

    private visitWhileStatement(stmt:WhileStatement) {
        try {
            while(this.isTruthy(this.evaluate(stmt._expression))) {
                this.executeStatement(stmt._statement);
            }
        }
        catch(b) {
            if ((b as SignalBreakFromLoop) == null) {
                throw b;
            }
        }
    }

    private visitAssignmentExpression(expr:AssignmentExpression) {
        this._env.assign(expr._name.lexeme, this.evaluate(expr._value));
    }

    private visitBinaryExpression(expr:BinaryExpression) {
        
        var left = this.evaluate(expr._left);
        var right = this.evaluate(expr._right);

        if (left == null || right == null)
        {
            throw new Error("Null reference");
        }

        switch(expr._operand.type)
        {
            case TokenType.MINUS:
                return left - right;
            case TokenType.SLASH:
                return left / right;
            case TokenType.STAR:
                return left * right;
            case TokenType.PLUS:
                return left + right;
            case TokenType.POW:
                return left ** right;
            case TokenType.GREATER:
                return left > right;
            case TokenType.GREATER_EQUAL:
                return left >= right;
            case TokenType.LESS:
                return left < right;
            case TokenType.LESS_EQUAL:
                return left <= right;
            case TokenType.BANG_EQUAL:
                return !this.areEqual(left, right);
            case TokenType.EQUAL_EQUAL:
                return this.areEqual(left, right);                          
        }   

        return null;
    }

    visitCallExpression(expr:CallExpression) {

        var callee = this.evaluate(expr._callee) as ICallable;

        var args:any[] = new Array();

        for(var i = 0; i < expr._args.length; i++) {

            var arg = expr._args[i] as Statement;

            if (arg.getStatementType() == 'Function') {
                args.push(arg);
            }
            else {
                args.push(this.evaluate(arg));
            }            
        }

        return callee.call(this, args);
    }

    private visitGroupingExpression(expr:GroupingExpression) {
        return this.evaluate(expr._expr);
    }

    private visitLiteralExpression(expr:LiteralExpression) {
        return expr._value;
    }

    private visitLogicalExpression(expr:LogicalExpression) {
        var left = this.evaluate(expr._left);

        // Short circuit means we only evaluate the left side if that's enough

        if (!this.isTruthy(left) && expr._operand.type == TokenType.AND) return false;
        if (this.isTruthy(left) && expr._operand.type == TokenType.OR) return true;

        // It wasn't enough

        var right = this.evaluate(expr._right);

        switch(expr._operand.type)
        {
            case TokenType.AND:
                return this.isTruthy(left) && this.isTruthy(right);
            case TokenType.OR:
                return this.isTruthy(left) || this.isTruthy(right);
        }

        return null;
    }

    private visitUnaryExpression(expr:UnaryExpression) {
        var right = this.evaluate(expr._right);

        switch(expr._operand.type)
        {
            case TokenType.MINUS:
                return 0-right;
            case TokenType.BANG:
                return !this.isTruthy(right);
        }   

        return null;
    }

    private visitVariableExpression(expr:VariableExpression) {
        return this._env.get(expr._name.lexeme);
    }
}