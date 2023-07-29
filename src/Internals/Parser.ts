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
import { SmolBool } from "./SmolVariableTypes/SmolBool";
import { SmolNull } from "./SmolVariableTypes/SmolNull";
import { SmolUndefined } from "./SmolVariableTypes/SmolUndefined";
import { SmolNumber } from "./SmolVariableTypes/SmolNumber";

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
        const statements:Statement[] = [];

        while(!this.endOfTokenStream()) {
            statements.push(this.declaration());
        }

        return statements;
    }

    private endOfTokenStream() : boolean {
        return this.peek().type == TokenType.EOF;
    }

    private match(...tokenTypes:TokenType[]) : boolean {
        
        for(let i = 0; i < tokenTypes.length; i++) {
            if (this.check(tokenTypes[i])) {
                this.advance();
                return true;
            }
        }

        return false;
    }

    private check(tokenType:TokenType, skip = 0) : boolean
    {
        if (this.endOfTokenStream()) return false;

        return (this.peek(skip).type == tokenType);
    }

    private peek(skip = 0) : Token {
        return (this._tokens as Token[])[this._currentTokenIndex + skip];
    }

    private advance() : Token {
        if (!this.endOfTokenStream()) this._currentTokenIndex++;

        return this.previous();
    }

    private previous(skip = 0) : Token
    {
        return (this._tokens as Token[])[this._currentTokenIndex - 1 - (skip * 1)];
    }

    private consume(tokenType:TokenType, errorIfNotFound:string ) : Token
    {
        if (this.check(tokenType)) return this.advance();

        // If we expected a ; but got a newline, we just wave it through
        if (tokenType == TokenType.SEMICOLON && (this._tokens as Token[])[this._currentTokenIndex - 1].followed_by_line_break) {
            return new Token(TokenType.SEMICOLON, "", "", -1, -1, -1, -1);
        }

        // If we expected a ; but got a }, we also wave that through
        if (tokenType == TokenType.SEMICOLON && this.check(TokenType.RIGHT_BRACE)) {
            return new Token(TokenType.SEMICOLON, "", "", -1, -1, -1, -1);
        }

        throw new Error('ERROR IN PARSER: ' + errorIfNotFound + ' but got ' + this.peek().lexeme + ' [line: ' + this.previous().line.toString() + ']');
    }

    private declaration() : Statement {

        if (this.match(TokenType.VAR)) return this.varDeclaration(); 
        if (this.match(TokenType.FUNC)) return this.functionDeclaration();
        if (this.match(TokenType.CLASS)) return this.classDeclaration();

        return this.statement();
    }

    private varDeclaration() : Statement {

        const firstTokenIndex = this._currentTokenIndex - 1;

        const name = this.consume(TokenType.IDENTIFIER, "Expected variable name");
        let initializerExpr:Expression|undefined = undefined;

        if (this.match(TokenType.EQUAL))
        {
            initializerExpr = this.expression();
        }

        if (this.peek().type != TokenType.SEMICOLON)
        {
            // What?
        }
        else 
        {
            this.consume(TokenType.SEMICOLON, "Expected ;");
        }

        const lastTokenIndex = this._currentTokenIndex - 2;

        const stmt = new VarStatement(name, initializerExpr);

        stmt.firstTokenIndex = firstTokenIndex;
        stmt.lastTokenIndex = lastTokenIndex;

        return stmt;
    }

    private functionDeclaration() {
       
        const functionName =  this.consume(TokenType.IDENTIFIER, "Expected function name");
        const functionParams:Token[] = [];

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
        
        const functionBody = this.block();

        return new FunctionStatement(functionName, functionParams, functionBody);
    }

    private classDeclaration() {
       
        const className = this.consume(TokenType.IDENTIFIER, "Expected function name");
        let superclassName:Token|undefined = undefined;
        const functions:FunctionStatement[] = new Array<FunctionStatement>();

        if (this.match(TokenType.COLON)) {
            superclassName = this.consume(TokenType.IDENTIFIER, "Expected superclass name");
        }

        this.consume(TokenType.LEFT_BRACE, "Expected {");
        
        while (!this.check(TokenType.RIGHT_BRACE) && !this.endOfTokenStream()) {
        
            if (this.check(TokenType.IDENTIFIER) && this.check(TokenType.LEFT_BRACKET, 1)) {
                const classFn = this.functionDeclaration();

                functions.push(classFn);
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
        const expr:Expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new PrintStatement(expr);
    }

    private throwStatement() : ThrowStatement {
        const expr:Expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expected ;");
        return new ThrowStatement(expr);
    }

    private returnStatement() : ReturnStatement {
        if (this.peek().type == TokenType.SEMICOLON) {
            this.consume(TokenType.SEMICOLON, "Expected ;");
            return new ReturnStatement(undefined); // Could be literal undefined.
        }
        else {
            const expr = this.expression();
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
        const stmts:Statement[] = [];

        while (!this.check(TokenType.RIGHT_BRACE) && !this.endOfTokenStream()) {
            stmts.push(this.declaration());
        }

        this.consume(TokenType.RIGHT_BRACE, "Expected '}' after block.");

        return new BlockStatement(stmts);
    }

    private ifStatement() : Statement {

        this.consume(TokenType.LEFT_BRACKET, "Expected (");

        const expr = this.expression();

        this.consume(TokenType.RIGHT_BRACKET, "Expected )");

        const stmt = this.statement();

        if (this.match(TokenType.ELSE)) {

            const then = this.statement();

            return new IfStatement(expr, stmt, then);
        }
        else {
            return new IfStatement(expr, stmt, undefined);
        }
    }

    private whileStatement() : Statement {

        this.consume(TokenType.LEFT_BRACKET, "Expected (");

        const expr = this.expression();

        this.consume(TokenType.RIGHT_BRACKET, "Expected )");

        const stmt = this.statement();

        return new WhileStatement(expr, stmt);
    }

    private tryStatement() : TryStatement {

        this.consume(TokenType.LEFT_BRACE, "Expected {");
        const tryBody:BlockStatement = this.block();
        let catchBody:BlockStatement|undefined = undefined;
        let finallyBody:BlockStatement|undefined = undefined;
        let exceptionVarName:Token|undefined = undefined;

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

        let condition:Expression;

        if (!this.check(TokenType.SEMICOLON))
        {
            condition = this.expression();
        }
        else
        {
            condition = new LiteralExpression(new SmolBool(true));
        }

        this.consume(TokenType.SEMICOLON, "Expected ;");

        let increment:Expression|undefined; // Expression

        if (!this.check(TokenType.RIGHT_BRACKET))
        {
            increment = this.expression();
        }

        this.consume(TokenType.RIGHT_BRACKET, "Expected )");

        let body = this.statement();

        if (increment != null)
        {
            const innerStmts:Statement[] = [body, new ExpressionStatement(increment)];

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
        
        const firstTokenIndex = this._currentTokenIndex;

        const expr:Expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expected ;");

        const lastTokenIndex = this._currentTokenIndex - 2;

        const stmt = new ExpressionStatement(expr);

        stmt.firstTokenIndex = firstTokenIndex;
        stmt.lastTokenIndex = lastTokenIndex;

        return stmt;

    }

    private expression() : Expression {
        const expr = this.assignment();

        if (this.match(TokenType.QUESTION_MARK))
        {
            const thenExpression = this.expression(); // This isn't right, need to work out correct order
            this.consume(TokenType.COLON, "Expected :");
            const elseExpression = this.expression();

            return new TernaryExpression(expr, thenExpression, elseExpression);
        }

        return expr;
    }

    private assignment() : Expression {
        
        const expr = this.functionExpression();

        if (this.match(TokenType.EQUAL))
        {
            //var equals:Token = this.previous();
            const value:Expression = this.assignment();

            if (expr instanceof VariableExpression) {
                const name = (expr as VariableExpression).name;
                return new AssignExpression(name, value);
            }
            else if (expr instanceof GetExpression) {            
                const getExpr = expr as GetExpression;
                return new SetExpression(getExpr.obj, getExpr.name, value);
            }
            else if (expr instanceof IndexerGetExpression) {
                const getIndexerExpr = expr as IndexerGetExpression;
                return new IndexerSetExpression(getIndexerExpr.obj, getIndexerExpr.indexerExpr, value);
            }

            throw new Error("Invalid assignment target");
        }

        if (this.match(TokenType.PLUS_EQUALS))
        {
            const originalToken = this.previous();
            const value:Expression = this.assignment();
            const additionExpr = new BinaryExpression(expr, new Token(TokenType.PLUS, "+=", undefined, originalToken.line, originalToken.col, originalToken.start_pos, originalToken.end_pos), value);

            if (expr instanceof VariableExpression) {
                const name = (expr as VariableExpression).name;
                return new AssignExpression(name, additionExpr);
            }
            else if (expr instanceof GetExpression) {            
                const getExpr = expr as GetExpression;
                return new SetExpression(getExpr.obj, getExpr.name, additionExpr);
            }
            else if (expr instanceof IndexerGetExpression) {
                const getIndexerExpr = expr as IndexerGetExpression;
                return new IndexerSetExpression(getIndexerExpr.obj, getIndexerExpr.indexerExpr, additionExpr);
            }

            throw new Error("Invalid assignment target");
        }

        if (this.match(TokenType.MINUS_EQUALS))
        {
            const originalToken = this.previous();
            const value:Expression = this.assignment();
            const subtractExpr = new BinaryExpression(expr, new Token(TokenType.MINUS, "-=", undefined, originalToken.line, originalToken.col, originalToken.start_pos, originalToken.end_pos), value);

            if (expr instanceof VariableExpression) {
                const name = (expr as VariableExpression).name;
                return new AssignExpression(name, subtractExpr);
            }
            else if (expr instanceof GetExpression) {            
                const getExpr = expr as GetExpression;
                return new SetExpression(getExpr.obj, getExpr.name, subtractExpr);
            }
            else if (expr instanceof IndexerGetExpression) {
                const getIndexerExpr = expr as IndexerGetExpression;
                return new IndexerSetExpression(getIndexerExpr.obj, getIndexerExpr.indexerExpr, subtractExpr);
            }

            throw new Error("Invalid assignment target");
        }

        if (this.match(TokenType.DIVIDE_EQUALS))
        {
            const originalToken = this.previous();
            const value:Expression = this.assignment();
            const divideExpr = new BinaryExpression(expr, new Token(TokenType.DIVIDE, "/=", undefined, originalToken.line, originalToken.col, originalToken.start_pos, originalToken.end_pos), value);

            if (expr instanceof VariableExpression) {
                const name = (expr as VariableExpression).name;
                return new AssignExpression(name, divideExpr);
            }
            else if (expr instanceof GetExpression) {            
                const getExpr = expr as GetExpression;
                return new SetExpression(getExpr.obj, getExpr.name, divideExpr);
            }
            else if (expr instanceof IndexerGetExpression) {
                const getIndexerExpr = expr as IndexerGetExpression;
                return new IndexerSetExpression(getIndexerExpr.obj, getIndexerExpr.indexerExpr, divideExpr);
            }

            throw new Error("Invalid assignment target");
        }

        if (this.match(TokenType.MULTIPLY_EQUALS))
        {
            const originalToken = this.previous();
            const value:Expression = this.assignment();
            const multiplyExpr = new BinaryExpression(expr, new Token(TokenType.MULTIPLY, "*=", undefined, originalToken.line, originalToken.col, originalToken.start_pos, originalToken.end_pos), value);

            if (expr instanceof VariableExpression) {
                const name = (expr as VariableExpression).name;
                return new AssignExpression(name, multiplyExpr);
            }
            else if (expr instanceof GetExpression) {            
                const getExpr = expr as GetExpression;
                return new SetExpression(getExpr.obj, getExpr.name, multiplyExpr);
            }
            else if (expr instanceof IndexerGetExpression) {
                const getIndexerExpr = expr as IndexerGetExpression;
                return new IndexerSetExpression(getIndexerExpr.obj, getIndexerExpr.indexerExpr, multiplyExpr);
            }

            throw new Error("Invalid assignment target");
        }

        if (this.match(TokenType.POW_EQUALS))
        {
            const originalToken = this.previous();
            const value:Expression = this.assignment();
            const powExpr = new BinaryExpression(expr, new Token(TokenType.POW, "**=", undefined, originalToken.line, originalToken.col, originalToken.start_pos, originalToken.end_pos), value);

            if (expr instanceof VariableExpression) {
                const name = (expr as VariableExpression).name;
                return new AssignExpression(name, powExpr);
            }
            else if (expr instanceof GetExpression) {            
                const getExpr = expr as GetExpression;
                return new SetExpression(getExpr.obj, getExpr.name, powExpr);
            }
            else if (expr instanceof IndexerGetExpression) {
                const getIndexerExpr = expr as IndexerGetExpression;
                return new IndexerSetExpression(getIndexerExpr.obj, getIndexerExpr.indexerExpr, powExpr);
            }

            throw new Error("Invalid assignment target");
        }

        return expr;
    }

    private functionExpression() : Expression {

        if (this.match(TokenType.FUNC))
        {
            // _statementCallStack.Push("FUNCTION");

            const functionParams:Token[] = [];

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

            const functionBody = this.block();

            //_ = _statementCallStack.Pop();

            return new FunctionExpression(functionParams, functionBody);
        }

        return this.logicalOr();
    }

    private logicalOr() : Expression
    {
        let expr = this.logicalAnd();

        while(this.match(TokenType.LOGICAL_OR))
        {
            const op = this.previous();
            const right = this.logicalAnd();
            expr = new LogicalExpression(expr, op, right);
        }

        return expr;
    }

    private logicalAnd() : Expression
    {
        let expr = this.equality();

        while(this.match(TokenType.LOGICAL_AND))
        {
            const op = this.previous();
            const right = this.equality();
            expr = new LogicalExpression(expr, op, right);
        }

        return expr;
    }

    private equality() : Expression {
        
        let expr = this.comparison();

        while(this.match(TokenType.NOT_EQUAL, TokenType.EQUAL_EQUAL))
        {
            const op = this.previous();
            const right = this.comparison();
            expr = new BinaryExpression(expr, op, right);
        }

        return expr;
    }

    private comparison() : Expression {

        let expr = this.bitwise_op();

        while(this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL))
        {
            const op = this.previous();
            const right = this.term();
            expr = new BinaryExpression(expr, op, right);
        }

        return expr;
    }

    private bitwise_op() : Expression {
    
        let expr = this.term();

        while (this.match(TokenType.BITWISE_AND, TokenType.BITWISE_OR, TokenType.REMAINDER))
        {
            const op = this.previous();
            const right = this.term();
            expr = new BinaryExpression(expr, op, right);
        }

        return expr;
    }

    private term() : Expression {

        let expr:Expression = this.factor();

        while(this.match(TokenType.MINUS, TokenType.PLUS))
        {
            const op:Token = this.previous();
            const right:Expression = this.factor();
            expr = new BinaryExpression(expr, op, right);
        }

        return expr;
    }

    private factor() : Expression {
        
        let expr:Expression = this.pow();

        while(this.match(TokenType.MULTIPLY, TokenType.DIVIDE))
        {
            const op:Token = this.previous();
            const right:Expression = this.pow();
            expr = new BinaryExpression(expr, op, right);
        }

        return expr;
    }

    private pow():Expression
    {
        let expr = this.unary();

        while(this.match(TokenType.POW))
        {
            const op = this.previous();
            const right = this.unary();
            expr = new BinaryExpression(expr, op, right);
        }

        return expr;
    }

    private unary() : Expression
    {
        if(this.match(TokenType.NOT, TokenType.MINUS))
        {
            const op = this.previous();
            const right = this.unary();
            return new UnaryExpression(op, right);
        }

        return this.call();
    }

    private call() : Expression
    {
        let expr = this.primary();

        // eslint-disable-next-line no-constant-condition
        while (true)
        {
            if (this.match(TokenType.LEFT_BRACKET))
            {
                expr = this.finishCall(expr, (expr instanceof GetExpression));
            }
            else if (this.match(TokenType.LEFT_SQUARE_BRACKET))
            {
                const indexerExpression = this.expression();

                this.consume(TokenType.RIGHT_SQUARE_BRACKET, "Expected ]");

                expr = new IndexerGetExpression(expr, indexerExpression);
            }
            else if (this.match(TokenType.DOT))
            {
                const name = this.consume(TokenType.IDENTIFIER, "Expect property name after '.'.");
                expr = new GetExpression(expr, name);
            }
            else
            {
                break;
            }
        }

        return expr;
    }

    private finishCall(callee:Expression, isFollowingGetter = false) : Expression
    {
        const args = new Array<Expression>();

        if (!this.check(TokenType.RIGHT_BRACKET))
        {
            do { args.push(this.expression()); } while (this.match(TokenType.COMMA));
        }

        this.consume(TokenType.RIGHT_BRACKET, "Expected )");

        return new CallExpression(callee, args, isFollowingGetter);
    }

    private primary() : Expression {

        if (this.match(TokenType.FALSE)) return new LiteralExpression(new SmolBool(false));
        if (this.match(TokenType.TRUE)) return new LiteralExpression(new SmolBool(true));
        if (this.match(TokenType.NULL)) return new LiteralExpression(new SmolNull());
        if (this.match(TokenType.UNDEFINED)) return new LiteralExpression(new SmolUndefined());

        if(this.match(TokenType.NUMBER))
        {
            return new LiteralExpression(new SmolNumber(Number(this.previous().literal)));
        }

        if(this.match(TokenType.STRING))
        {
            return new LiteralExpression(new SmolString(this.previous().literal as string));
        }

        if (this.match(TokenType.PREFIX_INCREMENT))
        {
            if (this.match(TokenType.IDENTIFIER))
            {
                return new VariableExpression(this.previous(), TokenType.PREFIX_INCREMENT);
            }
        }

        if (this.match(TokenType.PREFIX_DECREMENT))
        {
            if (this.match(TokenType.IDENTIFIER))
            {
                return new VariableExpression(this.previous(), TokenType.PREFIX_DECREMENT);
            }
        }

        if (this.match(TokenType.IDENTIFIER))
        {
            if (this.match(TokenType.POSTFIX_INCREMENT))
            {
                return new VariableExpression(this.previous(1), TokenType.POSTFIX_INCREMENT);
            }
            else if (this.match(TokenType.POSTFIX_DECREMENT))
            {
                return new VariableExpression(this.previous(1), TokenType.POSTFIX_DECREMENT);
            }
            else
            {
                return new VariableExpression(this.previous(), undefined);
            }
        }

        if (this.match(TokenType.NEW))
        {
            const className = this.consume(TokenType.IDENTIFIER, "Expected identifier after new");

            this.consume(TokenType.LEFT_BRACKET, "Expect ')' after expression.");

            const args = new Array<Expression>();

            if (!this.check(TokenType.RIGHT_BRACKET))
            {
                do { args.push(this.expression()); } while (this.match(TokenType.COMMA));
            }

            this.consume(TokenType.RIGHT_BRACKET, "Expected )");

            return new NewInstanceExpression(className, args);
        }

        if (this.match(TokenType.LEFT_SQUARE_BRACKET))
        {
            const originalToken = this.previous();
            const className = new Token(TokenType.IDENTIFIER, "Array", undefined, originalToken.line, originalToken.col, originalToken.start_pos, originalToken.end_pos);
            
            const args = new Array<Expression>();

            if (!this.check(TokenType.RIGHT_SQUARE_BRACKET))
            {
                do { args.push(this.expression()); } while (this.match(TokenType.COMMA));
            }

            this.consume(TokenType.RIGHT_SQUARE_BRACKET, "Expected ]");

            return new NewInstanceExpression(className, args);
        }

        if (this.match(TokenType.LEFT_BRACE))
        {
            const originalToken = this.previous();
            const className = new Token(TokenType.IDENTIFIER, "Object", undefined, originalToken.line, originalToken.col, originalToken.start_pos, originalToken.end_pos);

            const args = new Array<Expression>();

            if (!this.check(TokenType.RIGHT_BRACE))
            {
                do
                {
                    const name = this.consume(TokenType.IDENTIFIER, "Expected idetifier");
                    this.consume(TokenType.COLON, "Exepcted :");
                    const value = this.expression();

                    args.push(new ObjectInitializerExpression(name, value));

                } while (this.match(TokenType.COMMA));
            }

            this.consume(TokenType.RIGHT_BRACE, "Expected }");

            return new NewInstanceExpression(className, args);
        }


        if (this.match(TokenType.LEFT_BRACKET)) 
        {
            const expr = this.expression();
            this.consume(TokenType.RIGHT_BRACKET, "Expect ')' after expression.");
            return new GroupingExpression(expr);
        }

        throw new Error(`Parser did not expect to see token "${TokenType[this.peek().type]}" on line ${this.peek().line}, sorry :(`);
    }
} 