import { TokenType } from "./TokenType";
import { Token } from "./Token";
import { VarStatement } from "./Ast/Statements/VarStatement";
import { Expression } from "./Ast/Expressions/Expression";
import { LiteralExpression } from "./Ast/Expressions/LiteralExpression";
import { GroupingExpression } from "./Ast/Expressions/GroupingExpression";
import { VariableExpression } from "./Ast/Expressions/VariableExpression";
import { BinaryExpression } from "./Ast/Expressions/BinaryExpression";
import { AssignExpression } from "./Ast/Expressions/AssignExpression";
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
import { ClassStatement } from "./Ast/Statements/ClassStatement";
import { ThrowStatement } from "./Ast/Statements/ThrowStatement";
import { ContinueStatement } from "./Ast/Statements/ContinueStatement";
import { DebuggerStatement } from "./Ast/Statements/DebuggerStatement";
import { TryStatement } from "./Ast/Statements/TryStatement";
import { TernaryExpression } from "./Ast/Expressions/TernaryExpression";
import { SetExpression } from "./Ast/Expressions/SetExpression";
import { IndexerSetExpression } from "./Ast/Expressions/IndexerSetExpression";
import { GetExpression } from "./Ast/Expressions/GetExpression";
import { IndexerGetExpression } from "./Ast/Expressions/IndexerGetExpression";
import { FunctionExpression } from "./Ast/Expressions/FunctionExpression";
import { NewInstanceExpression } from "./Ast/Expressions/NewInstanceExpression";
import { ObjectInitializerExpression } from "./Ast/Expressions/ObjectInitializerExpression";
import { SmolString } from "./SmolVariableTypes/SmolString";

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

    private check(tokenType:TokenType, skip:number = 0) : boolean
    {
        if (this.endOfTokenStream()) return false;

        return (this.peek(skip).type == tokenType);
    }

    private peek(skip:number = 0) : Token {
        return (this._tokens as Token[])[this._currentTokenIndex + skip];
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
        if (this.match(TokenType.CLASS)) return this.classDeclaration();

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

    private classDeclaration() {
       
        var className = this.consume(TokenType.IDENTIFIER, "Expected function name");
        var superclassName:any = null;
        var functions:FunctionStatement[] = new Array<FunctionStatement>();

        if (this.match(TokenType.COLON)) {
            superclassName = this.consume(TokenType.IDENTIFIER, "Expected superclass name");
        }

        this.consume(TokenType.LEFT_BRACE, "Expected {");
        
        while (!this.check(TokenType.RIGHT_BRACE) && !this.endOfTokenStream) {
          
            if (this.check(TokenType.IDENTIFIER) && this.check(TokenType.LEFT_BRACKET, 1))
            {
                functions.push(this.functionDeclaration());
            }
            else
            {
                throw new Error(`Didn't expect to find ${this.peek()} in the class body`);
            }
        }
        
        this.consume(TokenType.RIGHT_BRACE, "Expected }");

        return new ClassStatement(className, superclassName, functions);
    }

    private statement() : Statement {
        if (this.match(TokenType.IF)) return this.ifStatement();
        if (this.match(TokenType.WHILE)) return this.whileStatement();
        if (this.match(TokenType.LEFT_BRACE)) return this.block();
        if (this.match(TokenType.PRINT)) return this.printStatement();
        if (this.match(TokenType.BREAK)) return this.breakStatement();
        if (this.match(TokenType.RETURN)) return this.returnStatement();

        if (this.match(TokenType.TRY)) return this.tryStatement();
        if (this.match(TokenType.THROW)) return this.throwStatement();
        if (this.match(TokenType.FOR)) return this.forStatement();
        if (this.match(TokenType.CONTINUE)) return this.continueStatement();
        if (this.match(TokenType.DEBUGGER)) return this.debuggerStatement();

        return this.expressionStatement();
    }

    private printStatement() : PrintStatement {
        var expr:Expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new PrintStatement(expr);
    }

    private throwStatement() : ThrowStatement {
        var expr:Expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new ThrowStatement(expr);
    }

    private returnStatement() : ReturnStatement {
        if (this.peek().type == TokenType.SEMICOLON) {
            this.consume(TokenType.SEMICOLON, "Expected ;");
            return new ReturnStatement(); // Could be literal undefined.
        }
        else {
            var expr = this.expression();
            this.consume(TokenType.SEMICOLON, "Expected ;");
            return new ReturnStatement(expr);
        }
    }

    private breakStatement() : BreakStatement {

        // Todo: add checks for while loop

        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new BreakStatement();
    }

    private continueStatement() : ContinueStatement {

        // Todo: add checks for while loop

        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new ContinueStatement();
    }

    private debuggerStatement() : DebuggerStatement {

        // Todo: add checks for while loop

        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new DebuggerStatement();
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
            return new IfStatement(expr, stmt);
        }
    }

    private whileStatement() : Statement {

        this.consume(TokenType.LEFT_BRACKET, "Expected (");

        var expr = this.expression();

        this.consume(TokenType.RIGHT_BRACKET, "Expected )");

        var stmt = this.statement();

        return new WhileStatement(expr, stmt);
    }

    private tryStatement() : TryStatement {

        this.consume(TokenType.LEFT_BRACE, "Expected {");
        let tryBody:BlockStatement = this.block();
        let catchBody:BlockStatement|null = null;
        let finallyBody:BlockStatement|null = null;
        let exceptionVarName:Token|null = null;

        if (this.match(TokenType.CATCH))
        {
            if (this.match(TokenType.LEFT_BRACKET))
            {
                exceptionVarName = this.consume(TokenType.IDENTIFIER, "Expected a single variable name for exception variable");

                this.consume(TokenType.RIGHT_BRACKET, "Expected )");
            }

            this.consume(TokenType.LEFT_BRACE, "Expected {");
            catchBody = this.block();
        }

        if (this.match(TokenType.FINALLY))
        {
            this.consume(TokenType.LEFT_BRACE, "Expected {");
            finallyBody = this.block();
        }

        if (catchBody == null && finallyBody == null)
        {
            this.consume(TokenType.CATCH, "Expected catch or finally");
        }

        return new TryStatement(tryBody, exceptionVarName, catchBody, finallyBody);
    }

    private forStatement() : Statement {

        this.consume(TokenType.LEFT_BRACKET, "Expected (");

        let initialiser:Statement|null = null;

        if (this.match(TokenType.SEMICOLON))
        {
            initialiser = null;
        }
        else if (this.match(TokenType.VAR))
        {
            initialiser = this.varDeclaration();
        }
        else
        {
            initialiser = this.expressionStatement();
        }

        var condition:any = null; // Expression

        if (!this.check(TokenType.SEMICOLON))
        {
            condition = this.expression();
        }
        else
        {
            condition = new LiteralExpression(true);
        }

        this.consume(TokenType.SEMICOLON, "Expected ;");

        var increment:any = null; // Expression

        if (!this.check(TokenType.RIGHT_BRACKET))
        {
            increment = this.expression();
        }

        this.consume(TokenType.RIGHT_BRACKET, "Expected )");

        var body = this.statement();

        if (increment != null)
        {
            var innerStmts:Statement[];

            innerStmts = [body, new ExpressionStatement(increment)];

            body = new BlockStatement(innerStmts);
        }

        body = new WhileStatement(condition, body);

        if (initialiser != null)
        {               
            body = new BlockStatement([initialiser, body]);
        }

        return body;
    }


    private expressionStatement() : ExpressionStatement {
        var expr:Expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new ExpressionStatement(expr);
    }

    private expression() : Expression {
        var expr = this.assignment();

        if (this.match(TokenType.QUESTION_MARK))
        {
            var thenExpression = this.expression(); // This isn't right, need to work out correct order
            this.consume(TokenType.COLON, "Expected :");
            var elseExpression = this.expression();

            return new TernaryExpression(expr, thenExpression, elseExpression);
        }

        return expr;
    }

    private assignment() : Expression {
        
        var expr = this.functionExpression();

        if (this.match(TokenType.EQUAL))
        {
            //var equals:Token = this.previous();
            var value:Expression = this.assignment();

            if (expr instanceof VariableExpression) {
                var name = (expr as VariableExpression)._name;
                return new AssignExpression(name, value);
            }
            else if (expr instanceof GetExpression) {            
                var getExpr = expr as GetExpression;
                return new SetExpression(getExpr._obj, getExpr._name, value);
            }
            else if (expr instanceof IndexerGetExpression) {
                var getIndexerExpr = expr as IndexerGetExpression;
                return new IndexerSetExpression(getIndexerExpr._obj, getIndexerExpr._indexerExpr, value);
            }

            throw new Error("Invalid assignment target");
        }

        // Todo: Plus_Equals etc.

        return expr;
    }

    private functionExpression() : Expression {

        if (this.match(TokenType.FUNC))
        {
            // _statementCallStack.Push("FUNCTION");

            var functionParams:Token[] = new Array<Token>();

            this.consume(TokenType.LEFT_BRACKET, "Expected (");

            if (!this.check(TokenType.RIGHT_BRACKET))
            {
                do
                {
                    /*
                    if (functionParams.length >= 127)
                    {
                        this.error(this.peek(), "Can't define a function with more than 127 parameters.");
                    }*/

                    functionParams.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name"));
                } while (this.match(TokenType.COMMA));
            }

            this.consume(TokenType.RIGHT_BRACKET, "Expected )");
            this.consume(TokenType.LEFT_BRACE, "Expected {");

            var functionBody = this.block();

            //_ = _statementCallStack.Pop();

            return new FunctionExpression(functionParams, functionBody);
        }

        return this.logicalOr();
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

        var expr = this.bitwise_op();

        while(this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL))
        {
            var op = this.previous();
            var right = this.term();
            expr = new BinaryExpression(expr, op, right);
        }

        return expr;
    }

    private bitwise_op() : Expression {
    
        var expr = this.term();

        while (this.match(TokenType.BITWISE_AND, TokenType.BITWISE_OR, TokenType.REMAINDER))
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

        while (true)
        {
            if (this.match(TokenType.LEFT_BRACKET))
            {
                expr = this.finishCall(expr, (expr instanceof GetExpression));
            }
            else if (this.match(TokenType.LEFT_SQUARE_BRACKET))
            {
                var indexerExpression = this.expression();

                var closingParen = this.consume(TokenType.RIGHT_SQUARE_BRACKET, "Expected ]");

                expr = new IndexerGetExpression(expr, indexerExpression);
            }
            else if (this.match(TokenType.DOT))
            {
                var name = this.consume(TokenType.IDENTIFIER, "Expect property name after '.'.");
                expr = new GetExpression(expr, name);
            }
            else
            {
                break;
            }
        }

        return expr;
    }

    private finishCall(callee:Expression, isFollowingGetter:Boolean = false) : Expression
    {
        var args = new Array<Expression>();

        if (!this.check(TokenType.RIGHT_BRACKET))
        {
            do { args.push(this.expression()); } while (this.match(TokenType.COMMA));
        }

        var closingParen = this.consume(TokenType.RIGHT_BRACKET, "Expected )");

        return new CallExpression(callee, args, isFollowingGetter);
    }

    private primary() : Expression {

        if (this.match(TokenType.FALSE)) return new LiteralExpression(false);
        if (this.match(TokenType.TRUE)) return new LiteralExpression(true);
        if (this.match(TokenType.NULL)) return new LiteralExpression(null);
        if (this.match(TokenType.UNDEFINED)) return new LiteralExpression(undefined);

        if(this.match(TokenType.NUMBER))
        {
            return new LiteralExpression(Number(this.previous().literal!));
        }

        if(this.match(TokenType.STRING))
        {
            var str = new SmolString(this.previous().literal!);
            return new LiteralExpression(str);
        }

        if (this.match(TokenType.IDENTIFIER))
        {
            return new VariableExpression(this.previous(), null);
        }


        if (this.match(TokenType.NEW))
        {
            var className = this.consume(TokenType.IDENTIFIER, "Expected identifier after new");

            this.consume(TokenType.LEFT_BRACKET, "Expect ')' after expression.");

            var args = new Array<Expression>();

            if (!this.check(TokenType.RIGHT_BRACKET))
            {
                do { args.push(this.expression()); } while (this.match(TokenType.COMMA));
            }

            var closingParen = this.consume(TokenType.RIGHT_BRACKET, "Expected )");

            return new NewInstanceExpression(className, args);
        }

        if (this.match(TokenType.LEFT_SQUARE_BRACKET))
        {
            var className = new Token(TokenType.IDENTIFIER, "Array", null, this.peek().line);
            
            var args = new Array<Expression>();

            if (!this.check(TokenType.RIGHT_SQUARE_BRACKET))
            {
                do { args.push(this.expression()); } while (this.match(TokenType.COMMA));
            }

            var closingParen = this.consume(TokenType.RIGHT_SQUARE_BRACKET, "Expected ]");

            return new NewInstanceExpression(className, args);
        }

        if (this.match(TokenType.LEFT_BRACE))
        {
            var className = new Token(TokenType.IDENTIFIER, "Object", null, this.peek().line);

            var args = new Array<Expression>();

            if (!this.check(TokenType.RIGHT_BRACE))
            {
                do
                {
                    var name = this.consume(TokenType.IDENTIFIER, "Expected idetifier");
                    this.consume(TokenType.COLON, "Exepcted :");
                    var value = this.expression();

                    args.push(new ObjectInitializerExpression(name, value));

                } while (this.match(TokenType.COMMA));
            }

            var closingParen = this.consume(TokenType.RIGHT_BRACE, "Expected }");

            return new NewInstanceExpression(className, args);
        }


        if (this.match(TokenType.LEFT_BRACKET)) 
        {
            var expr = this.expression();
            this.consume(TokenType.RIGHT_BRACKET, "Expect ')' after expression.");
            return new GroupingExpression(expr);
        }

        throw new Error(`Parser did not expect to see token "${TokenType[this.peek().type]}" on line ${this.peek().line}, sorry :(`);
    }
} 