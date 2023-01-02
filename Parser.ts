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

export class Parser {

    _tokens:Token[];
    _currentTokenIndex:number = 0;

    constructor(tokens:Token[]) {
        this._tokens = tokens;
    }

    parse() : void {

        var p = new AstDebugPrinter();

        while(!this.endOfTokenStream()) {

            //console.log(this._currentTokenIndex);
            //console.log(this.declaration());

            p.print(this.declaration());
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

    declaration() {

        if (this.match(TokenType.VAR)) return this.varDeclaration(); 
        //if (this.match([TokenType.FUNC])) return this.functionDeclaration(); 

        return this.statement();
    }

    varDeclaration() {

        var name = this.consume(TokenType.IDENTIFIER, "Expected variable name");

        this.consume(TokenType.EQUAL, "Expected =");

        // Slight difference here versus c# version, tbc
        var initializer = this.expression();

        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new VarStatement(name, initializer);
    }

    functionDeclaration() {

    }

    statement() {
        if (this.match(TokenType.PRINT)) return this.printStatement();

        return this.expressionStatement();
    }

    printStatement() : PrintStatement{
        var expr:Expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new PrintStatement(expr);
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
        
        var expr = this.term();

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

    term() : Expression {

        var expr:Expression = this.factor();

        while(this.match(TokenType.MINUS, TokenType.PLUS))
        {
            var op:Token = this.previous();
            var right:Expression = this.factor();
            expr = new BinaryExpression(expr, op, right);
        }

        return expr;
    }

    factor() : Expression {
        var expr:Expression = this.primary();

        while(this.match(TokenType.STAR, TokenType.SLASH))
        {
            var op:Token = this.previous();
            var right:Expression = this.primary();
            expr = new BinaryExpression(expr, op, right);
        }

        return expr;
    }

    primary() : Expression {

        if (this.match(TokenType.FALSE)) return new LiteralExpression(false);
        if (this.match(TokenType.TRUE)) return new LiteralExpression(true);
        if (this.match(TokenType.NIL)) return new LiteralExpression(null);

        if(this.match(TokenType.NUMBER, TokenType.STRING))
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

        throw new Error(`Parser did not expect to see token "${this.peek().lexeme}" on line ${this.peek().line}, sorry :(`);

        //throw error(peek(), $"Parser did not expect to see '{peek().lexeme}' on line {peek().line}, sorry :(");

    }
} 