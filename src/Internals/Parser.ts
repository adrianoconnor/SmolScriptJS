import { TokenType } from "./TokenType";
import { Token } from "./Token";
import { VarStatement } from "./Ast/Statements/VarStatement";
import { Expression } from "./Ast/Expressions/Expression";
import { LiteralExpression } from "./Ast/Expressions/LiteralExpression";
import { GroupingExpression } from "./Ast/Expressions/GroupingExpression";
import { VariableExpression } from "./Ast/Expressions/VariableExpression";
import { BinaryExpression } from "./Ast/Expressions/BinaryExpression";
import { AssignmentExpression } from "./Ast/Expressions/AssignmentExpression";
import { ExpressionStatement } from "./Ast/Statements/ExpressionStatement";
import { Statement } from "./Ast/Statements/Statement";
import { PrintStatement } from "./Ast/Statements/PrintStatement";
import { IfStatement } from "./Ast/Statements/IfStatement";
import { LogicalExpression } from "./Ast/Expressions/LogicalExpression";
import { CallExpression } from "./Ast/Expressions/CallExpression";
import { UnaryExpression } from "./Ast/Expressions/UnaryExpression";
import { WhileStatement } from "./Ast/Statements/WhileStatement";
import { FunctionStatement } from "./Ast/Statements/FunctionStatement";
import { BlockStatement } from "./Ast/Statements/BlockStatement";
import { BreakStatement } from "./Ast/Statements/BreakStatement";
import { ReturnStatement } from "./Ast/Statements/ReturnStatement";

export class Parser {

    private _tokens?:Token[];
    private _currentTokenIndex:number;

    private constructor(tokens:Token[]) {
        this._tokens = tokens;
        this._currentTokenIndex = 0;

        
    }

    static parse(tokens:Token[]) : Statement[] {

        return new Parser(tokens)._doParse();
    }

    private _doParse() : Statement[] {
        var statements:Statement[] = new Array();

        while(!this.endOfTokenStream()) {
            statements.push(this.declaration());
        }

        return statements;
    }

    private endOfTokenStream() : boolean {
        return this.peek().type == TokenType.EOF;
    }

    private match(...tokenTypes:TokenType[]) : boolean {
        var _this = this;

        for(var i = 0; i < tokenTypes.length; i++) {
            if (_this.check(tokenTypes[i])) {
                _this.advance();
                return true;
            }
        }

        return false;
    }

    private check(tokenType:TokenType) : boolean
    {
        if (this.endOfTokenStream()) return false;

        return (this.peek().type == tokenType);
    }

    private peek() : Token {
        return (this._tokens as Token[])[this._currentTokenIndex];
    }

    private advance() : Token {
        if (!this.endOfTokenStream()) this._currentTokenIndex++;

        return this.previous();
    }

    private previous() : Token
    {
        return (this._tokens as Token[])[this._currentTokenIndex - 1];
    }

    private consume(tokenType:TokenType, errorIfNotFound:string ) : Token
    {
        if (this.check(tokenType)) return this.advance();

        //Console.WriteLine(peek().type);

        throw new Error(errorIfNotFound);
        //throw error(peek(), errorIfNotFound);
    }

    private declaration() : Statement {

        if (this.match(TokenType.VAR)) return this.varDeclaration(); 
        if (this.match(TokenType.FUNC)) return this.functionDeclaration();

        return this.statement();
    }

    private varDeclaration() : Statement {

        var name = this.consume(TokenType.IDENTIFIER, "Expected variable name");
        var initializerExpr:any = null;

        if (this.match(TokenType.EQUAL))
        {
            initializerExpr = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expected ;");

        return new VarStatement(name, initializerExpr);
    }

    private functionDeclaration() {
       
        var functionName =  this.consume(TokenType.IDENTIFIER, "Expected function name");
        var functionParams:Token[] = new Array();

        this.consume(TokenType.LEFT_BRACKET, "Expected (");
        
        if (!this.check(TokenType.RIGHT_BRACKET)) {
            do {
                if (functionParams.length >= 127) {
                    //error(peek(), "Can't define a function with more than 127 parameters.");
                    throw new Error("Too many params");
                }

                functionParams.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name"));
            } while (this.match(TokenType.COMMA));
        }
        
        this.consume(TokenType.RIGHT_BRACKET, "Expected )");
        this.consume(TokenType.LEFT_BRACE, "Expected {");
        
        var functionBody = this.block();

        return new FunctionStatement(functionName, functionParams, functionBody);
    }

    private statement() : Statement {
        if (this.match(TokenType.PRINT)) return this.printStatement();
        if (this.match(TokenType.IF)) return this.ifStatement();
        if (this.match(TokenType.WHILE)) return this.whileStatement();
        if (this.match(TokenType.LEFT_BRACE)) return this.block();
        if (this.match(TokenType.BREAK)) return this.breakStatement();
        if (this.match(TokenType.RETURN)) return this.returnStatement();

        return this.expressionStatement();
    }

    private printStatement() : PrintStatement{
        var expr:Expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new PrintStatement(expr);
    }

    private ifStatement() : Statement {

        this.consume(TokenType.LEFT_BRACKET, "Expected (");

        var expr = this.expression();

        this.consume(TokenType.RIGHT_BRACKET, "Expected )");

        var stmt = this.statement();

        if (this.match(TokenType.ELSE)) {

            var then = this.statement();

            return new IfStatement(expr, stmt, then);
        }
        else {
            return new IfStatement(expr, stmt, undefined);
        }
    }

    private whileStatement() : Statement {

        this.consume(TokenType.LEFT_BRACKET, "Expected (");

        var expr = this.expression();

        this.consume(TokenType.RIGHT_BRACKET, "Expected )");

        var stmt = this.statement();

        return new WhileStatement(expr, stmt);
    }

    private block() : BlockStatement
    {
        var stmts:Statement[] = new Array();

        while (!this.check(TokenType.RIGHT_BRACE) && !this.endOfTokenStream()) {
            stmts.push(this.declaration());
        }

        this.consume(TokenType.RIGHT_BRACE, "Expected '}' after block.");

        return new BlockStatement(stmts);
    }

    private breakStatement() : BreakStatement {
        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new BreakStatement();
    }

    private returnStatement() : ReturnStatement {
        if (this.peek().type == TokenType.SEMICOLON) {
            this.consume(TokenType.SEMICOLON, "Expected ;");
            return new ReturnStatement(undefined);
        }
        else {
            var expr = this.expression();
            this.consume(TokenType.SEMICOLON, "Expected ;");
            return new ReturnStatement(expr);
        }
    }

    private expressionStatement() : Statement {
        var expr:Expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new ExpressionStatement(expr);
    }

    private expression() : Expression {
        return this.assignment();
    }

    private assignment() : Expression {
        
        var expr = this.logicalOr();

        if (this.match(TokenType.EQUAL))
        {
            var equals:Token = this.previous();
            var value:Expression = this.assignment();

            var variableExpr:VariableExpression = expr as VariableExpression;
            
            if (variableExpr != null)
            {
                var name:Token = variableExpr._name;
                return new AssignmentExpression(name, value);
            }

            throw new Error("Invalid assignment target");
        }

        return expr;
    }

    private logicalOr() : Expression
    {
        var expr = this.logicalAnd();

        while(this.match(TokenType.LOGICAL_OR))
        {
            var op = this.previous();
            var right = this.logicalAnd();
            expr = new LogicalExpression(expr, op, right);
        }

        return expr;
    }

    private logicalAnd() : Expression
    {
        var expr = this.equality();

        while(this.match(TokenType.LOGICAL_AND))
        {
            var op = this.previous();
            var right = this.equality();
            expr = new LogicalExpression(expr, op, right);
        }

        return expr;
    }

    private equality() : Expression {
        
        var expr = this.comparison();

        while(this.match(TokenType.NOT_EQUAL, TokenType.EQUAL_EQUAL))
        {
            var op = this.previous();
            var right = this.comparison();
            expr = new BinaryExpression(expr, op, right);
        }

        return expr;
    }

    private comparison() : Expression {

        var expr = this.term();

        while(this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL))
        {
            var op = this.previous();
            var right = this.term();
            expr = new BinaryExpression(expr, op, right);
        }

        return expr;
    }

    private term() : Expression {

        var expr:Expression = this.factor();

        while(this.match(TokenType.MINUS, TokenType.PLUS))
        {
            var op:Token = this.previous();
            var right:Expression = this.factor();
            expr = new BinaryExpression(expr, op, right);
        }

        return expr;
    }

    private factor() : Expression {
        var expr:Expression = this.pow();

        while(this.match(TokenType.MULTIPLY, TokenType.DIVIDE))
        {
            var op:Token = this.previous();
            var right:Expression = this.pow();
            expr = new BinaryExpression(expr, op, right);
        }

        return expr;
    }

    private pow():Expression
    {
        var expr = this.unary();

        while(this.match(TokenType.POW))
        {
            var op = this.previous();
            var right = this.unary();
            expr = new BinaryExpression(expr, op, right);
        }

        return expr;
    }

    private unary() : Expression
    {
        if(this.match(TokenType.NOT, TokenType.MINUS))
        {
            var op = this.previous();
            var right = this.unary();
            return new UnaryExpression(op, right);
        }

        return this.call();
    }

    private call() : Expression
    {
        var expr = this.primary();

        while(true)
        {
            if (this.match(TokenType.LEFT_BRACKET))
            {
                expr = this.finishCall(expr);
            }
            else 
            {
                break;
            }
        }

        return expr;
    }

    private finishCall(callee:Expression) : Expression
    {
        var args:any[] = new Array();

        if (!this.check(TokenType.RIGHT_BRACKET))
        {
            do 
            {
                if (this.match(TokenType.FUNC))
                {
                    var x = this.functionDeclaration();
                    console.log(x);
                    // Anonymous function                        
                    args.push(x);
                }
                else
                {
                    args.push(this.expression());
                }
            } while (this.match(TokenType.COMMA));
        }

        var closingParen = this.consume(TokenType.RIGHT_BRACKET, "Expected )");

        return new CallExpression(callee, closingParen, args);
    }

    private primary() : Expression {

        if (this.match(TokenType.FALSE)) return new LiteralExpression(false);
        if (this.match(TokenType.TRUE)) return new LiteralExpression(true);
        if (this.match(TokenType.NULL)) return new LiteralExpression(null);

        if(this.match(TokenType.NUMBER))
        {
            return new LiteralExpression(Number(this.previous().literal!));
        }

        if(this.match(TokenType.STRING))
        {
            return new LiteralExpression(this.previous().literal!);
        }

        if (this.match(TokenType.IDENTIFIER))
        {
            return new VariableExpression(this.previous());
        }

        if (this.match(TokenType.LEFT_BRACKET)) 
        {
            var expr:Expression = this.expression();
            this.consume(TokenType.RIGHT_BRACKET, "Expect ')' after expression.");
            return new GroupingExpression(expr);
        }

        throw new Error(`Parser did not expect to see token "${TokenType[this.peek().type]}" on line ${this.peek().line}, sorry :(`);

        //throw error(peek(), $"Parser did not expect to see '{peek().lexeme}' on line {peek().line}, sorry :(");

    }
} 