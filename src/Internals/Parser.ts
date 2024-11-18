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
            
            if (this.peek().type == TokenType.SEMICOLON) {
                // Swallow any stray semi-colons 
                this.consume(TokenType.SEMICOLON, "");
            }
            else {
                statements.push(this.declaration());
            }
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
            // We need to return a token, so we'll make a fake semicolon
            return new Token(TokenType.SEMICOLON, "", "", -1, -1, -1, -1);
        }

        // If we expected a ; but got a }, we also wave that through
        if (tokenType == TokenType.SEMICOLON && (this.check(TokenType.RIGHT_BRACE) || this.peek().type == TokenType.EOF)) {
            return new Token(TokenType.SEMICOLON, "", "", -1, -1, -1, -1);
        }

        throw new Error('ERROR IN PARSER: ' + errorIfNotFound + ' but got ' + TokenType[this.peek().type] + ' [line: ' + this.previous().line.toString() + ']');
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

        const skip = this.consume(TokenType.SEMICOLON, "Expected ;").start_pos == -1 ? 1 : 2;
        const lastTokenIndex = this._currentTokenIndex - skip;

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

        const tokenIndex = this._currentTokenIndex - 1;

        if (this.peek().type == TokenType.SEMICOLON 
                || this.peek().type == TokenType.RIGHT_BRACE
                || this.previous().followed_by_line_break) {
                                        
            this.consume(TokenType.SEMICOLON, "Expected ;");

            var returnStmt = new ReturnStatement(undefined);
            returnStmt.tokenIndex = tokenIndex;
            return returnStmt;
        }
        else {
            const exprFirstTokenIndex = this._currentTokenIndex;
            const expr = this.expression();
            const exprLastTokenIndex = this._currentTokenIndex - 1;
            
            this.consume(TokenType.SEMICOLON, "Expected ;");

            var returnStmt = new ReturnStatement(expr);
            returnStmt.tokenIndex = tokenIndex;
            returnStmt.exprFirstTokenIndex = exprFirstTokenIndex;
            returnStmt.exprLastTokenIndex = exprLastTokenIndex;
            return returnStmt;
        }
    }

    private breakStatement() : BreakStatement {

        // Todo: add checks for while loop

        const tokenIndex = this._currentTokenIndex - 1;

        this.consume(TokenType.SEMICOLON, "Expected ;");
        
        var stmt = new BreakStatement();
        stmt.tokenIndex = tokenIndex;

        return stmt;
    }

    private continueStatement() : ContinueStatement {

        // Todo: add checks for while loop

        const tokenIndex = this._currentTokenIndex - 1;

        this.consume(TokenType.SEMICOLON, "Expected ;");

        var stmt = new ContinueStatement();
        stmt.tokenIndex = tokenIndex;

        return stmt;
    }

    private debuggerStatement() : DebuggerStatement {

        // Todo: add checks for while loop

        const tokenIndex = this._currentTokenIndex - 1;

        this.consume(TokenType.SEMICOLON, "Expected ;");

        var stmt = new DebuggerStatement();
        stmt.tokenIndex = tokenIndex;

        return stmt;
    }


    private block() : BlockStatement
    {
        const blockFirstTokenIndex = this._currentTokenIndex - 1;

        const stmts:Statement[] = [];

        while (!this.check(TokenType.RIGHT_BRACE) && !this.endOfTokenStream()) {
            stmts.push(this.declaration());
        }

        this.consume(TokenType.RIGHT_BRACE, "Expected '}' after block.");
        
        const blockLastTokenIndex = this._currentTokenIndex - 1;

        var blockStmt = new BlockStatement(stmts);
        blockStmt.blockStartTokenIndex = blockFirstTokenIndex;
        blockStmt.blockEndTokenIndex = blockLastTokenIndex;

        return blockStmt;
    }

    private ifStatement() : Statement {

        const exprFirstTokenIndex = this._currentTokenIndex - 1;

        this.consume(TokenType.LEFT_BRACKET, "Expected (");

        const expr = this.expression();

        this.consume(TokenType.RIGHT_BRACKET, "Expected )");

        const exprLastTokenIndex = this._currentTokenIndex - 1;

        const thenFirstTokenIndex = this._currentTokenIndex;

        const stmt = this.statement();

        const thenLastTokenIndex = this._currentTokenIndex - 1; // TODO: Semi-colon check

        var elseStmt:Statement|undefined;

        if (this.match(TokenType.ELSE)) {
            elseStmt = this.statement();   
        }

        const ifStmt = new IfStatement(expr, stmt, elseStmt);
    
        ifStmt.exprFirstTokenIndex = exprFirstTokenIndex;
        ifStmt.exprLastTokenIndex = exprLastTokenIndex;   
        ifStmt.thenFirstTokenIndex = thenFirstTokenIndex;
        ifStmt.thenLastTokenIndex = thenLastTokenIndex;
        return ifStmt;
    }

    private whileStatement() : Statement {

        const exprFirstTokenIndex = this._currentTokenIndex - 1;

        this.consume(TokenType.LEFT_BRACKET, "Expected (");

        const expr = this.expression();

        this.consume(TokenType.RIGHT_BRACKET, "Expected )");

        const exprLastTokenIndex = this._currentTokenIndex - 1;

        const stmtFirstTokenIndex = this._currentTokenIndex;

        const stmt = this.statement();

        const stmtLastTokenIndex = this._currentTokenIndex - 1; // TODO: Check what ; does to this!

        const whileStmt = new WhileStatement(expr, stmt);

        whileStmt.exprFirstTokenIndex = exprFirstTokenIndex;
        whileStmt.exprLastTokenIndex = exprLastTokenIndex;
        whileStmt.stmtFirstTokenIndex = stmtFirstTokenIndex;
        whileStmt.stmtLastTokenIndex = stmtLastTokenIndex;

        return whileStmt;
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
        let conditionFirstTokenIndex:number|undefined;
        let conditionLastTokenIndex:number|undefined;

        if (!this.check(TokenType.SEMICOLON))
        {
            conditionFirstTokenIndex = this._currentTokenIndex;
            condition = this.expression();
            conditionLastTokenIndex = this._currentTokenIndex - 1;
        }
        else
        {
            condition = new LiteralExpression(new SmolBool(true));
        }

        this.consume(TokenType.SEMICOLON, "Expected ;");

        let increment:Expression|undefined; // Expression
        let incrFirstTokenIndex:number|undefined;
        let incrLastTokenIndex:number|undefined;
        

        if (!this.check(TokenType.RIGHT_BRACKET))
        {
            incrFirstTokenIndex = this._currentTokenIndex;
            increment = this.expression();
            incrLastTokenIndex = this._currentTokenIndex - 1;
        }

        this.consume(TokenType.RIGHT_BRACKET, "Expected )");

        let body = this.statement();

        if (increment != null)
        {
            let incrExprStmt = new ExpressionStatement(increment);
            incrExprStmt.firstTokenIndex = incrFirstTokenIndex;
            incrExprStmt.lastTokenIndex = incrLastTokenIndex;
            const innerStmts:Statement[] = [body, incrExprStmt];

            body = new BlockStatement(innerStmts, true); // true is for 'inserted by parser' on the block statement
        }

        let whileStmt = new WhileStatement(condition, body);

        whileStmt.exprFirstTokenIndex = conditionFirstTokenIndex;
        whileStmt.exprLastTokenIndex = conditionLastTokenIndex;

        if (initialiser != null)
        {               
            return new BlockStatement([initialiser, whileStmt], true);
        }
        else {
            return whileStmt;
        }
    }


    private expressionStatement() : ExpressionStatement {
        
        const firstTokenIndex = this._currentTokenIndex;

        const expr:Expression = this.expression();

        const skip = this.consume(TokenType.SEMICOLON, "Expected ;").start_pos == -1 ? 1 : 2;
        const lastTokenIndex = this._currentTokenIndex - skip;

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

        // TODO: Refactor this junk...

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

        if (this.match(TokenType.REMAINDER_EQUALS))
        {
            const originalToken = this.previous();
            const value:Expression = this.assignment();
            const remainderExpr = new BinaryExpression(expr, new Token(TokenType.REMAINDER, "%=", undefined, originalToken.line, originalToken.col, originalToken.start_pos, originalToken.end_pos), value);

            if (expr instanceof VariableExpression) {
                const name = (expr as VariableExpression).name;
                return new AssignExpression(name, remainderExpr);
            }
            else if (expr instanceof GetExpression) {            
                const getExpr = expr as GetExpression;
                return new SetExpression(getExpr.obj, getExpr.name, remainderExpr);
            }
            else if (expr instanceof IndexerGetExpression) {
                const getIndexerExpr = expr as IndexerGetExpression;
                return new IndexerSetExpression(getIndexerExpr.obj, getIndexerExpr.indexerExpr, remainderExpr);
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

        if ((this.peek().type == TokenType.LEFT_BRACKET || this.peek().type == TokenType.IDENTIFIER) && this.isInFatArrow(false))
        {
            return this.fatArrowFunctionExpression(false);
        }
        else if (this.match(TokenType.FUNC))
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

        if (this.match(TokenType.START_OF_EMBEDDED_STRING_EXPRESSION)) 
            {
                const expr = this.expression();
                this.consume(TokenType.END_OF_EMBEDDED_STRING_EXPRESSION, "Expect ')' after expression.");
                return new GroupingExpression(expr, true);
            }

        throw new Error(`Parser did not expect to see token "${TokenType[this.peek().type]}" on line ${this.peek().line}, sorry :(`);
    }

    private fatArrowFunctionExpression(openBracketConsumed:Boolean = false):FunctionExpression
    {
        //this._statementCallStack.Push("FUNCTION");
        
        if (!openBracketConsumed && this.check(TokenType.LEFT_BRACKET))
        {
            this.consume(TokenType.LEFT_BRACKET, "Expected (");
            
            openBracketConsumed = true;
        }

        const functionParams:Token[] = [];
                
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

        if (openBracketConsumed)
        {
            this.consume(TokenType.RIGHT_BRACKET, "Expected )");
        }

        this.consume(TokenType.FAT_ARROW, "Expected =>");

        if (this.check(TokenType.LEFT_BRACE))
        {
            this.consume(TokenType.LEFT_BRACE, "Expected {");

            var functionBody = this.block();
                    
            //_ = _statementCallStack.Pop();

            return new FunctionExpression(functionParams, functionBody);
        }
        else
        {
            const funcBodyStmts:Statement[] = [];

            funcBodyStmts.push(new ReturnStatement(this.expression()));

            const functionBody = new BlockStatement(funcBodyStmts);

            //_ = _statementCallStack.Pop();

            return new FunctionExpression(functionParams, functionBody);
        }
    }

    private isInFatArrow(openBracketConsumed:Boolean = true) : Boolean
    {
        // If we've jsut consumed an opening bracket we need to look ahead for
        //  (x) => 
        // or
        //  (x, y, z) =>
        
        var index = this._currentTokenIndex;
        
        // If we're looking at an expression, the current token could be an identifier and we just need to check if the next token is =>
        
        if (!openBracketConsumed)
        {
            if (!(this._tokens as Token[])[this._currentTokenIndex].followed_by_line_break && (this._tokens as Token[])[this._currentTokenIndex + 1].type == TokenType.FAT_ARROW)
            {
                return true;
            }
            else if ((this._tokens as Token[])[this._currentTokenIndex].type == TokenType.LEFT_BRACKET)
            {
                index++; // pretend we consumed the left brack and next section can serve both needs
            }
            else
            {
                return false;
            }
        }
        
        // The logic for brackets is a bit more involved...
        
        var previous = TokenType.LEFT_BRACKET;

        
        while (true)
        {
            if ((this._tokens as Token[])[index].followed_by_line_break && (this._tokens as Token[])[index].type != TokenType.FAT_ARROW) // => has to be on same line as (...), but newline can come after =>
            {
                break;
            }
            
            var next = (this._tokens as Token[])[index];

            if (previous == TokenType.LEFT_BRACKET && next.type == TokenType.RIGHT_BRACKET)
            {
                // Valid, move on to the next token
                index++;
            }
            else if (previous == TokenType.LEFT_BRACKET && next.type == TokenType.IDENTIFIER)
            {
                // Valid, move on to the next token
                index++;
            }
            else if (previous == TokenType.IDENTIFIER && (next.type == TokenType.COMMA || next.type == TokenType.RIGHT_BRACKET))
            {
                // Valid, move on to the next token
                index++;
            }
            else if (previous == TokenType.COMMA && next.type == TokenType.IDENTIFIER)
            {
                // Valid, move on to the next token
                index++;
            }
            else if (previous == TokenType.RIGHT_BRACKET && next.type == TokenType.FAT_ARROW)
            {
                // Valid, we're definitely dealing with a fat arrow
                return true;
            }
            else
            {
                break;
            }

            previous = next.type;
        }

        return false;
    }
} 