import { TokenType } from "./TokenType";
import { Token } from "./Token";
import { VarStatement } from "./Statements/VarStatement";
import { Expression } from "./Expressions/Expression";
import { LiteralExpression } from "./Expressions/LiteralExpression";
import { GroupingExpression } from "./Expressions/GroupingExpression";
import { VariableExpression } from "./Expressions/VariableExpression";
import { BinaryExpression } from "./Expressions/BinaryExpression";
import { AssignmentExpression } from "./Expressions/AssignmentExpression";
import { ExpressionStatement } from "./Statements/ExpressionStatement";
import { Statement } from "./Statements/Statement";
import { AstDebugPrinter } from "./AstDebugPrinter";
import { PrintStatement } from "./Statements/PrintStatement";
import { IfStatement } from "./Statements/IfStatement";
import { LogicalExpression } from "./Expressions/LogicalExpression";
import { CallExpression } from "./Expressions/CallExpression";
import { UnaryExpression } from "./Expressions/UnaryExpression";
import { WhileStatement } from "./Statements/WhileStatement";
import { FunctionStatement } from "./Statements/FunctionStatement";
import { BlockStatement } from "./Statements/BlockStatement";
import { BreakStatement } from "./Statements/BreakStatement";
import { ReturnStatement } from "./Statements/ReturnStatement";

export class Parser {

    _tokens:Token[];
    _currentTokenIndex:number = 0;
    _statements:Statement[] = new Array();

    constructor(tokens:Token[]) {
        this._tokens = tokens;
    }

    parse() : void {

        var p = new AstDebugPrinter();

        while(!this.endOfTokenStream()) {

            var stmt:Statement = this.declaration();

            //p.print(stmt);
            
            this._statements.push(stmt);
        }
    }

    endOfTokenStream() : boolean {
        return this.peek().type == TokenType.EOF;
    }

    match(...tokenTypes:TokenType[]) : boolean {
        var _this = this;

        for(var i = 0; i < tokenTypes.length; i++) {
            if (_this.check(tokenTypes[i])) {
                _this.advance();
                return true;
            }
        }

        return false;
    }

    check(tokenType:TokenType) : boolean
    {
        if (this.endOfTokenStream()) return false;

        return (this.peek().type == tokenType);
    }

    peek() : Token {
        return this._tokens[this._currentTokenIndex];
    }

    advance() : Token {
        if (!this.endOfTokenStream()) this._currentTokenIndex++;

        return this.previous();
    }

    previous() : Token
    {
        return this._tokens[this._currentTokenIndex - 1];
    }

    consume(tokenType:TokenType, errorIfNotFound:string ) : Token
    {
        if (this.check(tokenType)) return this.advance();

        //Console.WriteLine(peek().type);

        throw new Error(errorIfNotFound);
        //throw error(peek(), errorIfNotFound);
    }

    declaration() : Statement {

        if (this.match(TokenType.VAR)) return this.varDeclaration(); 
        if (this.match(TokenType.FUNC)) return this.functionDeclaration();

        return this.statement();
    }

    varDeclaration() : Statement {

        var name = this.consume(TokenType.IDENTIFIER, "Expected variable name");

        this.consume(TokenType.EQUAL, "Expected =");

        // Slight difference here versus c# version, tbc
        var initializer = this.expression();

        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new VarStatement(name, initializer);
    }

    functionDeclaration() {

        var functionName = undefined;

        if (!this.check(TokenType.LEFT_PAREN))
        {
            functionName = this.consume(TokenType.IDENTIFIER, "Expected function name");
        }

        var functionParams:Token[] = new Array();

        this.consume(TokenType.LEFT_PAREN, "Expected (");
        
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                if (functionParams.length >= 127) {
                    //error(peek(), "Can't define a function with more than 127 parameters.");
                    throw new Error("Too many params");
                }

                functionParams.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name"));
            } while (this.match(TokenType.COMMA));
        }
        
        this.consume(TokenType.RIGHT_PAREN, "Expected )");
        this.consume(TokenType.LEFT_BRACE, "Expected {");
        
        var functionBody = this.block();

        return new FunctionStatement(functionName, functionParams, functionBody);
    }

    statement() : Statement {
        if (this.match(TokenType.PRINT)) return this.printStatement();
        if (this.match(TokenType.IF)) return this.ifStatement();
        if (this.match(TokenType.WHILE)) return this.whileStatement();
        if (this.match(TokenType.LEFT_BRACE)) return this.block();
        if (this.match(TokenType.BREAK)) return this.breakStatement();
        if (this.match(TokenType.RETURN)) return this.returnStatement();

        return this.expressionStatement();
    }

    printStatement() : PrintStatement{
        var expr:Expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new PrintStatement(expr);
    }

    ifStatement() : Statement {

        this.consume(TokenType.LEFT_PAREN, "Expected (");

        var expr = this.expression();

        this.consume(TokenType.RIGHT_PAREN, "Expected )");

        var stmt = this.statement();

        if (this.match(TokenType.ELSE)) {

            var then = this.statement();

            return new IfStatement(expr, stmt, then);
        }
        else {
            return new IfStatement(expr, stmt, undefined);
        }
    }

    whileStatement() : Statement {

        this.consume(TokenType.LEFT_PAREN, "Expected (");

        var expr = this.expression();

        this.consume(TokenType.RIGHT_PAREN, "Expected )");

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
            return new ReturnStatement();
        }
        else {
            var expr = this.expression();
            this.consume(TokenType.SEMICOLON, "Expected ;");
            return new ReturnStatement(expr);
        }
    }

    expressionStatement() : Statement {
        var expr:Expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new ExpressionStatement(expr);
    }

    expression() : Expression {
        return this.assignment();
    }

    assignment() : Expression {
        
        var expr = this.logicalOr();

        if (this.match(TokenType.EQUAL))
        {
            var equals:Token = this.previous();
            var value:Expression = this.assignment();

            var variableExpr:VariableExpression = expr as VariableExpression;

            //if (expr.GetType() == typeof(Expression.Variable))
            if (variableExpr != null)
            {
                var name:Token = variableExpr._name;
                return new AssignmentExpression(name, value);
            }

            throw new Error("Invalid assignment target");
            //throw error(equals, "Invalid assignment target."); 
        }

        return expr;
    }

    private logicalOr() : Expression
    {
        var expr = this.logicalAnd();

        while(this.match(TokenType.OR))
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

        while(this.match(TokenType.AND))
        {
            var op = this.previous();
            var right = this.equality();
            expr = new LogicalExpression(expr, op, right);
        }

        return expr;
    }

    private equality() : Expression {
        
        var expr = this.comparison();

        while(this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL))
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

        while(this.match(TokenType.STAR, TokenType.SLASH))
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
        if(this.match(TokenType.BANG, TokenType.MINUS))
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
            if (this.match(TokenType.LEFT_PAREN))
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

        if (!this.check(TokenType.RIGHT_PAREN))
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

        var closingParen = this.consume(TokenType.RIGHT_PAREN, "Expected )");

        return new CallExpression(callee, closingParen, args);
    }

    private primary() : Expression {

        if (this.match(TokenType.FALSE)) return new LiteralExpression(false);
        if (this.match(TokenType.TRUE)) return new LiteralExpression(true);
        if (this.match(TokenType.NIL)) return new LiteralExpression(null);

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

        if (this.match(TokenType.LEFT_PAREN)) 
        {
            var expr:Expression = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
            return new GroupingExpression(expr);
        }

        throw new Error(`Parser did not expect to see token "${TokenType[this.peek().type]}" on line ${this.peek().line}, sorry :(`);

        //throw error(peek(), $"Parser did not expect to see '{peek().lexeme}' on line {peek().line}, sorry :(");

    }
} 