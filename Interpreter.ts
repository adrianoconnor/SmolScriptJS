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

export class Interpreter {

    run(statements:Statement[]) {
        for(var i = 0; i < statements.length; i++) {
            this.execute(statements[i]);
        }
    }

    execute(stmt:Statement) {
        var result = stmt.accept(this);
    }

    evaluate(expr:Expression)
    {
        return expr.accept(this);
    }

    isTruthy(value:any) {
        if (value == null || value == undefined) return false;
        if (value as Boolean != null) return value as Boolean;
        return true;
    }

    areEqual(a:any, b:any) {
        if ((a == null || a == undefined) && (b == null || b == undefined)) return true;
        if ((a == null || a == undefined) || (b == null || b == undefined)) return false;
        //return a == b; // JS danger!
        return a.equals(b);
    }

    stringify(value:any) {
        
        if (value == null || value == undefined) return "nil";

        if (value as string != null) return value as string;

        return value;
    }

    visitBlockStatement(stmt:BlockStatement) {
        //
    }

    visitBreakStatement(stmt:BreakStatement) {
        //
    }

    visitExpressionStatement(stmt:ExpressionStatement) {
        return this.evaluate(stmt._expression);
    }

    visitFunctionStatement(stmt:FunctionStatement) {
        //
    }

    visitIfStatement(stmt:IfStatement) {
        if (this.isTruthy(this.evaluate(stmt._expression))) {
            this.execute(stmt._statement);
        }
        else if (stmt._then != undefined) {
            this.execute(stmt._then);
        }
    }

    visitPrintStatement(stmt:PrintStatement) {
        console.log(this.stringify(this.evaluate(stmt._expression)));
    }

    visitReturnStatement(stmt:ReturnStatement) {
        // 
    }

    visitVarStatement(stmt:VarStatement) {
        //
    }

    visitWhileStatement(stmt:WhileStatement) {
        while(this.evaluate(stmt._expression)) {
            this.execute(stmt._statement);
        }
    }

    visitAssignmentExpression(expr:AssignmentExpression) {
        //
    }

    visitBinaryExpression(expr:BinaryExpression) {
        
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
                return null;
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
        //
    }

    visitGroupingExpression(expr:GroupingExpression) {
        return this.evaluate(expr._expr);
    }

    visitLiteralExpression(expr:LiteralExpression) {
        return expr._value;
    }

    visitLogicalExpression(expr:LogicalExpression) {
        //
    }

    visitUnaryExpression(expr:UnaryExpression) {
        //
    }

    visitVariableExpression(expr:VariableExpression) {
    }
}