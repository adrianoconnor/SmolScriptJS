import { ByteCodeInstruction } from "./ByteCodeInstruction";
import { OpCode } from "./OpCode";
import { SmolFunction } from "./SmolVariableTypes/SmolFunction";
import { SmolVariableType } from "./SmolVariableTypes/SmolVariableType";
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
import { ReturnStatement } from "./Ast/Statements/ReturnStatement";
import { ClassStatement } from "./Ast/Statements/ClassStatement";
import { ThrowStatement } from "./Ast/Statements/ThrowStatement";
import { TryStatement } from "./Ast/Statements/TryStatement";
import { TernaryExpression } from "./Ast/Expressions/TernaryExpression";
import { SetExpression } from "./Ast/Expressions/SetExpression";
import { IndexerSetExpression } from "./Ast/Expressions/IndexerSetExpression";
import { GetExpression } from "./Ast/Expressions/GetExpression";
import { IndexerGetExpression } from "./Ast/Expressions/IndexerGetExpression";
import { FunctionExpression } from "./Ast/Expressions/FunctionExpression";
import { NewInstanceExpression } from "./Ast/Expressions/NewInstanceExpression";
import { ObjectInitializerExpression } from "./Ast/Expressions/ObjectInitializerExpression";
import { Scanner } from "./Scanner";
import { Parser } from "./Parser";
import { SmolProgram } from "./SmolProgram";
import { SmolBool } from "./SmolVariableTypes/SmolBool";
import { TokenType } from "./TokenType";
import { SmolUndefined } from "./SmolVariableTypes/SmolUndefined";
import { SmolNumber } from "./SmolVariableTypes/SmolNumber";
import "./ArrayExtensions";
import { ContinueStatement } from "./Ast/Statements/ContinueStatement";
import { DebuggerStatement } from "./Ast/Statements/DebuggerStatement";
import { BreakStatement } from "./Ast/Statements/BreakStatement";

class WhileLoop {
    startOfLoop:number;
    endOfLoop:number;

    constructor(startOfLoop:number, endOfLoop:number) {
        this.startOfLoop = startOfLoop;
        this.endOfLoop = endOfLoop;
    }
}

export class Compiler {

    private _function_table:SmolFunction[] = [];
    private _function_bodies:ByteCodeInstruction[][] = new Array<ByteCodeInstruction[]>();

    private _nextLabel = 1;

    // Labels for jumoing to are just numeric place holders. When a code gen section needs to
    // create a new jump-location, it can use this function
    private reserveLabelId():number
    {
        return this._nextLabel++;
    }

    // This is our structure to hold the constants that appear in source and need to be
    // referenced by the program (e.g., numbers, strings, bools). We define some here
    // so that a few common ones always have the same index.
    private _constants:SmolVariableType[] = [];

    private _loopStack:Array<WhileLoop> = new Array<WhileLoop>();
    
    // This method can be called by any block that needs to create/reference a constant, either
    // getting the existing index of the value if we already have it, or inserting and returning
    // the new index 
    ensureConst(value:SmolVariableType) : number {

        let constIndex = -1;

        this._constants.forEach((e, i) => {
            if (e.getValue() === value.getValue()) { // e.equals(value)) {
                constIndex = i;                
            }
        });

        if (constIndex == -1) {
            constIndex = this._constants.push(value) - 1;
        }

        return constIndex;
    }

    public Compile(source:string) : SmolProgram {

        const t = Scanner.tokenize(source);
        const p = Parser.parse(t);

        const mainChunk = this.createChunk();
        mainChunk.appendInstruction(OpCode.START); // This NOP is here so if the user starts the program with step, it will immediately hit this and show the first real statement as the next/first instruction to execute
        mainChunk[0].isStatementStartpoint = true;
        
        for(let i = 0; i < p.length; i++) {
            const checkPoint = mainChunk.length;

            mainChunk.appendChunk(p[i].accept(this));

            //mainChunk[checkPoint].isStatementStartpoint = true;
        }

        mainChunk.appendInstruction(OpCode.EOF);
        mainChunk[mainChunk.length - 1].isStatementStartpoint = true;

        const program = new SmolProgram();
        program.constants = this._constants;
        program.code_sections.push(mainChunk);
        this._function_bodies.forEach((b) => program.code_sections.push(b));
        program.function_table = this._function_table;
        program.tokens = t;
        program.source = source;

        return program;
    }

    // Short hand helper method to keep the code a little tidier 
    private createChunk() : ByteCodeInstruction[] {
        return new Array<ByteCodeInstruction>();
    }

    private visitBlockStatement(stmt:BlockStatement) : ByteCodeInstruction[] {

        const chunk = this.createChunk();

        var enterScope = new ByteCodeInstruction(OpCode.ENTER_SCOPE);

        enterScope.token_map_start_index = stmt.blockStartTokenIndex;
        enterScope.token_map_end_index = stmt.blockStartTokenIndex;

        enterScope.isStatementStartpoint = !stmt.insertedByParser; // Only break on this statement if it's directly linked to actual user code

        chunk.appendChunk(enterScope);


        stmt.statements.forEach((blockStmt:Statement) => {
            
            const c = blockStmt.accept(this);
            //c[0].isStatementStartpoint = true;
            chunk.appendChunk(c);

        });

        var leaveScope = new ByteCodeInstruction(OpCode.LEAVE_SCOPE);
        leaveScope.token_map_start_index = stmt.blockEndTokenIndex;
        leaveScope.token_map_end_index = stmt.blockEndTokenIndex;
        if (stmt.insertedByParser == false) {
            leaveScope.isStatementStartpoint = true;
        }

        chunk.appendChunk(leaveScope);

        return chunk;
    }

    private visitBreakStatement(stmt:BreakStatement) : ByteCodeInstruction[] {        
        const chunk = this.createChunk();

        chunk.appendInstruction(OpCode.LOOP_EXIT, this._loopStack.peek().endOfLoop);
        chunk[0].isStatementStartpoint = true;
        chunk.mapTokens(stmt.tokenIndex, stmt.tokenIndex);
        
        return chunk;
    }

    private visitClassStatement(stmt:ClassStatement) : ByteCodeInstruction {

        stmt.functions.forEach((fn) => {
        
            const function_index = this._function_bodies.length + 1;
            const function_name = `@${stmt.className.lexeme}.${fn.name.lexeme}`;

            this._function_table.push(new SmolFunction(
                function_name,
                function_index,
                fn.parameters.length,
                fn.parameters.map<string>((p) => p.lexeme)
            ));
    
            const body = this.createChunk();

            body.appendChunk(fn.functionBody.accept(this));
    
            if (body.length == 0 || body.peek().opcode != OpCode.RETURN)
            {
                body.appendInstruction(OpCode.CONST, this.ensureConst(new SmolUndefined()));
                body.appendInstruction(OpCode.RETURN);
            }
    
            this._function_bodies.push(body);
        });

        // We are declaring a function, we don't add anything to the byte stream at the current loc.
        // When we allow functions as expressions and assignments we'll need to do something
        // here, I guess something more like load constant but for functions
        return new ByteCodeInstruction(OpCode.NOP);
    }

    private visitContinueStatement(stmt:ContinueStatement) : ByteCodeInstruction[] {

        const chunk = this.createChunk();

        chunk.appendInstruction(OpCode.LOOP_EXIT, this._loopStack.peek().startOfLoop);
        chunk[0].isStatementStartpoint = true;
        chunk.mapTokens(stmt.tokenIndex, stmt.tokenIndex);
        
        return chunk;
    }

    private visitDebuggerStatement(stmt:DebuggerStatement) : ByteCodeInstruction[] {

        const chunk = this.createChunk();

        chunk.appendInstruction(OpCode.DEBUGGER);
        chunk[0].isStatementStartpoint = true;
        chunk.mapTokens(stmt.tokenIndex, stmt.tokenIndex);

        return chunk;
    }

    private visitExpressionStatement(stmt:ExpressionStatement) : ByteCodeInstruction[] {

        const chunk = this.createChunk();

        chunk.appendChunk(stmt.expression.accept(this));
        chunk.appendInstruction(OpCode.POP_AND_DISCARD);

        chunk[0].isStatementStartpoint = true;
        chunk.mapTokens(stmt.firstTokenIndex, stmt.lastTokenIndex);

        return chunk;
    }
    
    private visitFunctionStatement(stmt:FunctionStatement) : ByteCodeInstruction {

        const function_index = this._function_bodies.length + 1;
        const function_name = stmt.name.lexeme;

        this._function_table.push(new SmolFunction(
            function_name,
            function_index,
            stmt.parameters.length,
            stmt.parameters.map<string>((p) => p.lexeme)
        ));

        const body = this.createChunk();

        body.appendChunk(stmt.functionBody.accept(this));

        if (body.length == 0 || body.peek().opcode != OpCode.RETURN)
        {
            body.appendInstruction(OpCode.CONST, this.ensureConst(new SmolUndefined()));
            body.appendInstruction(OpCode.RETURN);
        }

        this._function_bodies.push(body);

        // We are declaring a function, we don't add anything to the byte stream at the current loc.
        // When we allow functions as expressions and assignments we'll need to do something
        // here, I guess something more like load constant but for functions
        return new ByteCodeInstruction(OpCode.NOP);
    }
    

    private visitIfStatement(stmt:IfStatement) : ByteCodeInstruction[] {

        const chunk = this.createChunk();

        const notTrueLabel = this.reserveLabelId();

        chunk.appendChunk(stmt.expression.accept(this));
        chunk[0].isStatementStartpoint = true;

        chunk.appendInstruction(OpCode.JMPFALSE, notTrueLabel);

        const thenChunk = stmt.thenStatement.accept(this);
        
        if (thenChunk instanceof Array) {
            thenChunk.mapTokens(stmt.thenFirstTokenIndex, stmt.thenLastTokenIndex);
            if (stmt.thenStatement.getStatementType() != "Block") {        
                (thenChunk[0] as ByteCodeInstruction).isStatementStartpoint = true;
            }
        }
        else {
            (thenChunk as ByteCodeInstruction).token_map_start_index = stmt.thenFirstTokenIndex;
            (thenChunk as ByteCodeInstruction).token_map_end_index = stmt.thenLastTokenIndex;
        }
  
        chunk.appendChunk(thenChunk);

        if (stmt.elseStatement == undefined)
        {
            chunk.appendInstruction(OpCode.LABEL, notTrueLabel);
        }
        else
        {
            const skipElseLabel = this.reserveLabelId();
            
            chunk.appendInstruction(OpCode.JMP, skipElseLabel);
            chunk.appendInstruction(OpCode.LABEL, notTrueLabel);

            chunk.appendChunk(stmt.elseStatement.accept(this));

            chunk.appendInstruction(OpCode.LABEL, skipElseLabel);
        }

        chunk.mapTokens(stmt.exprFirstTokenIndex, stmt.exprLastTokenIndex);

        return chunk;
    }

    private visitPrintStatement(stmt:PrintStatement) : ByteCodeInstruction[] {

        const chunk = this.createChunk();

        chunk.appendChunk(stmt.expression.accept(this));
        chunk.appendInstruction(OpCode.PRINT);

        return chunk;
    }

    private visitReturnStatement(stmt:ReturnStatement) : ByteCodeInstruction[] {

        const chunk = this.createChunk()

        if (stmt.expression != undefined)
        {
            chunk.appendChunk(stmt.expression.accept(this));
        }
        else
        {
            chunk.appendInstruction(OpCode.CONST, this.ensureConst(new SmolUndefined()));
        }

        chunk.appendInstruction(OpCode.RETURN);
        chunk.mapTokens(stmt.tokenIndex, stmt.exprLastTokenIndex ?? stmt.tokenIndex);
        chunk[0].isStatementStartpoint = true;

        return chunk;
    }

    private visitTryStatement(stmt:TryStatement) : ByteCodeInstruction[] {

        const chunk = this.createChunk();

        const exceptionLabel = this.reserveLabelId();
        const finallyLabel = this.reserveLabelId();
        const finallyWithExceptionLabel = this.reserveLabelId();

        // This will create a try 'checkpoint' in the vm. If we hit an exception the
        // vm will rewind the stack back to this instruction and jump to the catch/finally.
        chunk.appendInstruction(OpCode.TRY, exceptionLabel, false);

        // If an exception happens inside the body, it will rewind the stack to the try that just went on
        // and that tells us where to jump to

        chunk.appendChunk(stmt.tryBody.accept(this));

        // If there was no exception, we need to get rid of that try checkpoint that's on the stack, we aren't
        // going back there even if there's an exception in the finally

        chunk.appendInstruction(OpCode.POP_AND_DISCARD);

        // Now execute the finally

        chunk.appendInstruction(OpCode.JMP, finallyLabel);
        chunk.appendInstruction(OpCode.LABEL, exceptionLabel);

        // We're now at the catch part -- even if the user didn't specify one, we'll have a default (of { throw })
        // We now should have the thrown exception on the stack, so if a throw happens inside the catch that will
        // be the thing that's thrown.

        chunk.appendInstruction(OpCode.TRY, finallyWithExceptionLabel, true); // True means keep the exception at the top of the stack

        if (stmt.catchBody != null)
        {
            if (stmt.exceptionVariableName != null)
            {
                chunk.appendInstruction(OpCode.ENTER_SCOPE);

                // Top of stack will be exception so store it in variable name

                chunk.appendInstruction(OpCode.DECLARE, stmt.exceptionVariableName.lexeme);
                chunk.appendInstruction(OpCode.STORE, stmt.exceptionVariableName.lexeme);
            }
            else
            {
                // Top of stack is exception, but no variable defined to hold it so get rid of it
                chunk.appendInstruction(OpCode.POP_AND_DISCARD);
            }

            chunk.appendChunk(stmt.catchBody.accept(this)); // Might be a throw inside here...

            if (stmt.exceptionVariableName != null)
            {
                chunk.appendInstruction(OpCode.LEAVE_SCOPE);
            }
        }
        else
        {
            // No catch body is replaced by single instruction to rethrow the exception, which is already on the top of the stack

            chunk.appendInstruction(OpCode.THROW);
        }

        // If we made it here we got through the catch block without a throw, so we're free to execute the regular
        // finally and carry on with execution, exception is fully handled.

        // Top of stack has to the try checkpoint, so get rid of it because we aren't going back there
        chunk.appendInstruction(OpCode.POP_AND_DISCARD);
        chunk.appendInstruction(OpCode.JMP, finallyLabel);
        chunk.appendInstruction(OpCode.LABEL, finallyWithExceptionLabel);

        // If we're here then we had a throw inside the catch, so execute the finally and then throw it again.
        // When we throw this time the try checkpoint has been removed so we'll bubble down the stack to the next
        // try checkpoint (if there is one -- and panic if not)

        if (stmt.finallyBody != null)
        {
            chunk.appendChunk(stmt.finallyBody.accept(this));

            // Instruction to check for unthrown exception and throw it
        }

        chunk.appendInstruction(OpCode.THROW);
        chunk.appendInstruction(OpCode.LABEL, finallyLabel);

        if (stmt.finallyBody != null)
        {
            chunk.appendChunk(stmt.finallyBody.accept(this));

            // Instruction to check for unthrown exception and throw it
        }

        // Hopefully that all works. It's mega dependent on the instructions leaving the stack in a pristine state -- no
        // half finished evaluations or anything. That's definitely going to be a problem.

        return chunk;
    }

    private visitThrowStatement(stmt:ThrowStatement) : ByteCodeInstruction[] {

        const chunk = this.createChunk();

        chunk.appendChunk(stmt.expression.accept(this));
        chunk.appendInstruction(OpCode.THROW);
        
        return chunk;
    }

    private visitVarStatement(stmt:VarStatement) : ByteCodeInstruction[] {

        const chunk = this.createChunk();

        chunk.appendInstruction(OpCode.DECLARE, stmt.name.lexeme);

        if (stmt.initializerExpression != undefined) {    
            chunk.appendChunk(stmt.initializerExpression.accept(this));
            chunk.appendInstruction(OpCode.STORE, stmt.name.lexeme);
        }

        chunk.mapTokens(stmt.firstTokenIndex, stmt.lastTokenIndex);
        chunk[0].isStatementStartpoint = true;

        return chunk;
    }

    private visitWhileStatement(stmt:WhileStatement) : ByteCodeInstruction[] {
        
        const chunk = this.createChunk();

        const startOfLoop = this.reserveLabelId();
        const endOfLoop = this.reserveLabelId();

        this._loopStack.push(new WhileLoop(startOfLoop, endOfLoop));

        chunk.appendInstruction(OpCode.LOOP_START);
        chunk.appendInstruction(OpCode.LABEL, startOfLoop);
        const whileExpr = stmt.whileCondition.accept(this);
        if (whileExpr[0] == undefined)
            whileExpr.isStatementStartpoint = true;
        else
           whileExpr[0].isStatementStartpoint = true;

        chunk.appendChunk(whileExpr);
        chunk.appendInstruction(OpCode.JMPFALSE, endOfLoop);

        const stmtChunk = stmt.executeStatement.accept(this);
        stmtChunk.mapTokens(stmt.stmtFirstTokenIndex, stmt.stmtLastTokenIndex);
        chunk.appendChunk(stmtChunk);

        chunk.appendInstruction(OpCode.JMP, startOfLoop);
        chunk.appendInstruction(OpCode.LABEL, endOfLoop);
        chunk.appendInstruction(OpCode.LOOP_END);

        chunk.mapTokens(stmt.exprFirstTokenIndex, stmt.exprLastTokenIndex);
        this._loopStack.pop();

        return chunk;
    }


    private visitAssignExpression(expr:AssignExpression) : ByteCodeInstruction[] {

        const chunk = this.createChunk();

        chunk.appendChunk(expr.value.accept(this));

        chunk.appendInstruction(OpCode.STORE, expr.name.lexeme);

        // This is so inefficient

        chunk.appendInstruction(OpCode.FETCH, expr.name.lexeme);

        chunk[0].isStatementStartpoint = true;

        return chunk;
    }

    private visitBinaryExpression(expr:BinaryExpression) : ByteCodeInstruction[] {
        
        const chunk = this.createChunk();

        chunk.appendChunk(expr.left.accept(this));
        chunk.appendChunk(expr.right.accept(this));

        switch (expr.op.type)
        {
            case TokenType.MINUS:
                chunk.appendInstruction(OpCode.SUB);
                break;

            case TokenType.DIVIDE:
                chunk.appendInstruction(OpCode.DIV);
                break;

            case TokenType.MULTIPLY:
                chunk.appendInstruction(OpCode.MUL);
                break;

            case TokenType.PLUS:
                chunk.appendInstruction(OpCode.ADD);
                break;

            case TokenType.POW:
                chunk.appendInstruction(OpCode.POW);
                break;

            case TokenType.REMAINDER:
                chunk.appendInstruction(OpCode.REM);
                break;

            case TokenType.EQUAL_EQUAL:
                chunk.appendInstruction(OpCode.EQL);
                break;

            case TokenType.NOT_EQUAL:
                chunk.appendInstruction(OpCode.NEQ);
                break;

            case TokenType.GREATER:
                chunk.appendInstruction(OpCode.GT);
                break;

            case TokenType.GREATER_EQUAL:
                chunk.appendInstruction(OpCode.GTE);
                break;

            case TokenType.LESS:
                chunk.appendInstruction(OpCode.LT);
                break;

            case TokenType.LESS_EQUAL:
                chunk.appendInstruction(OpCode.LTE);
                break;

            case TokenType.BITWISE_AND:
                chunk.appendInstruction(OpCode.BITWISE_AND);
                break;

            case TokenType.BITWISE_OR:
                chunk.appendInstruction(OpCode.BITWISE_OR);
                break;

            default:
                throw new Error("Binary operation not impleented");
        }

        return chunk;
    }

    private visitCallExpression(expr:CallExpression) : ByteCodeInstruction[] {
        
        const chunk = this.createChunk();

        // Evalulate the arguments from left to right and pop them on the stack.

        expr.args.reverse().forEach((arg) => {
            chunk.appendChunk((arg as Expression).accept(this));
        })

        chunk.appendChunk(expr.callee.accept(this)); // Load the function name onto the stack
        chunk.appendInstruction(OpCode.CALL, expr.args.length, expr.useObjectRef);

        return chunk;
    }

    private visitFunctionExpression(expr:FunctionExpression) : ByteCodeInstruction {

        const function_index = this._function_bodies.length + 1;
        const function_name = `$_anon_${function_index}`;

        this._function_table.push(new SmolFunction(
            function_name,
            function_index,
            expr.parameters.length,
            expr.parameters.map<string>((p) => p.lexeme)
        ));

        const body = this.createChunk();

        body.appendChunk(expr.functionBody.accept(this));

        if (body.length == 0 || body.peek().opcode != OpCode.RETURN)
        {
            body.appendInstruction(OpCode.CONST, this.ensureConst(new SmolUndefined()));
            body.appendInstruction(OpCode.RETURN);
        }

        this._function_bodies.push(body);

        return new ByteCodeInstruction(OpCode.FETCH, function_name);
    }

    private visitGetExpression(expr:GetExpression) : ByteCodeInstruction[] {
        
        const chunk = this.createChunk();

        chunk.appendChunk(expr.obj.accept(this));
        chunk.appendInstruction(OpCode.FETCH, expr.name.lexeme, true);

        return chunk;
    }

    private visitGroupingExpression(expr:GroupingExpression) : ByteCodeInstruction[]|ByteCodeInstruction {
        
        if (expr.castToStringForEmbeddedStringExpression)
        {
            // We use a group with this special flag to force a cast of a varible like `${a}` to string, where a is a number (or whatever).
            // This is important because interpolated strings are basically separate expressions joined with a +,
            // so `${a}${b}` is really a+b internally -- if we force both a and b to toString'd, then
            // you'll get a string concatenation instead of numbers being added...
            
            const chunk = this.createChunk();
            
            chunk.appendChunk(expr.expr.accept(this));
            chunk.appendInstruction(OpCode.FETCH, "toString", true);
            chunk.appendInstruction(OpCode.CALL, 0, true);
            
            return chunk;
        }
        else
        {
            return expr.expr.accept(this);
        }
    }

    private visitIndexerGetExpression(expr:IndexerGetExpression) : ByteCodeInstruction[] {
        
        const chunk = this.createChunk();

        chunk.appendChunk(expr.obj.accept(this));
        chunk.appendChunk(expr.indexerExpr.accept(this));
        chunk.appendInstruction(OpCode.FETCH, "@IndexerGet", true);

        return chunk;
    }
    
    private visitIndexerSetExpression(expr:IndexerSetExpression) : ByteCodeInstruction[] {
    
        const chunk = this.createChunk();

        chunk.appendChunk(expr.obj.accept(this));
        chunk.appendChunk(expr.value.accept(this));
        chunk.appendChunk(expr.indexerExpr.accept(this));
        chunk.appendInstruction(OpCode.STORE, "@IndexerSet", true);

        // This is so inefficient, but we need to read the saved value back onto the stack

        chunk.appendChunk(expr.obj.accept(this));

        // TODO: This won't even work for indexer++ etc.
        chunk.appendChunk(expr.indexerExpr.accept(this));

        chunk.appendInstruction(OpCode.FETCH, "@IndexerSet", true);

        return chunk;
    }

    private visitLiteralExpression(expr:LiteralExpression) : ByteCodeInstruction {

        const constIndex = this.ensureConst(expr.value);

        return new ByteCodeInstruction(OpCode.CONST, constIndex);
    }

    private visitLogicalExpression(expr:LogicalExpression) : ByteCodeInstruction[] {
        
        const chunk = this.createChunk();

        const shortcutLabel = this.reserveLabelId();
        const testCompleteLabel = this.reserveLabelId();

        switch (expr.op.type)
        {
            case TokenType.LOGICAL_AND:

                chunk.appendChunk(expr.left.accept(this));

                chunk.appendInstruction( OpCode.JMPFALSE, shortcutLabel);

                chunk.appendChunk(expr.right.accept(this));

                chunk.appendInstruction(OpCode.JMP, testCompleteLabel);

                chunk.appendInstruction(OpCode.LABEL, shortcutLabel);

                // We arrived at this point from the shortcut, which had to be FALSE, and that Jump-not-true
                // instruction popped the false result from the stack, so we need to put it back. I think a
                // specific test instruction would make this nicer, but for now we can live with a few extra steps...

                chunk.appendInstruction(OpCode.CONST, this.ensureConst(new SmolBool(false)));

                chunk.appendInstruction(OpCode.LABEL, testCompleteLabel);

                break;

            case TokenType.LOGICAL_OR:

                chunk.appendChunk(expr.left.accept(this));

                chunk.appendInstruction(OpCode.JMPTRUE, shortcutLabel);

                chunk.appendChunk(expr.right.accept(this));

                chunk.appendInstruction(OpCode.JMP, testCompleteLabel);

                chunk.appendInstruction(OpCode.LABEL, shortcutLabel);
 
                chunk.appendInstruction(OpCode.CONST, this.ensureConst(new SmolBool(true)));
        
                chunk.appendInstruction(OpCode.LABEL, testCompleteLabel);

                break;
        }

        return chunk;   
    }

    private visitNewInstanceExpression(expr:NewInstanceExpression) : ByteCodeInstruction[] {
        
        const chunk = this.createChunk();

        const className = expr.className.lexeme;

        // We need to tell the VM that we want to create an instance of a class.
        // It will need its own environment, and the instance info needs to be on the stack
        // so we can call the ctor, which needs to leave it on the stack afterwards
        // ready for whatever was wanting it in the first place
        chunk.appendInstruction(OpCode.CREATE_OBJECT, className);

        if (className != "Object")
        {
            expr.ctorArgs.reverse().forEach((arg) => {
                chunk.appendChunk(arg.accept(this));
            });

            chunk.appendInstruction(OpCode.DUPLICATE_VALUE, expr.ctorArgs.length); // We need two copies of that ref
        }
        else
        {
            chunk.appendInstruction(OpCode.DUPLICATE_VALUE, 0); // We need two copies of that ref
        }


        // Stack now has class instance value

        chunk.appendInstruction(OpCode.FETCH, `@${expr.className.lexeme}.constructor`, true);

        if (className == "Object")
        {
            expr.ctorArgs.reverse().forEach((arg) => {
                chunk.appendChunk(arg.accept(this));
            });
        }

        chunk.appendInstruction(OpCode.CALL, expr.ctorArgs.length, true);
        chunk.appendInstruction(OpCode.POP_AND_DISCARD); // We don't care about the ctor's return value

        return chunk;
    }

    private visitObjectInitializerExpression(expr:ObjectInitializerExpression) : ByteCodeInstruction[] {
        
        const chunk = this.createChunk();

        chunk.appendInstruction(OpCode.DUPLICATE_VALUE, 2);
        chunk.appendChunk(expr.value.accept(this));
        chunk.appendInstruction(OpCode.STORE, expr.name.lexeme, true);

        // We don't reload the value onto the stack for these...

        return chunk;
    }

    private visitSetExpression(expr:SetExpression) : ByteCodeInstruction[] {
        
        const chunk = this.createChunk();

        chunk.appendChunk(expr.obj.accept(this));
        chunk.appendChunk(expr.value.accept(this));
        chunk.appendInstruction(OpCode.STORE, expr.name.lexeme, true);

        // This is so inefficient, but we need to read the saved value back onto the stack

        chunk.appendChunk(expr.obj.accept(this));
        chunk.appendInstruction(OpCode.FETCH, expr.name.lexeme, true);

        return chunk;
    }

    private visitTernaryExpression(expr:TernaryExpression) : ByteCodeInstruction[] {
        
        const chunk = this.createChunk();
        const notTrueLabel = this.reserveLabelId();
        const endLabel = this.reserveLabelId();

        chunk.appendChunk(expr.evaluationExpression.accept(this));
        chunk.appendInstruction(OpCode.JMPFALSE, notTrueLabel);
        chunk.appendChunk(expr.expresisonIfTrue.accept(this));
        chunk.appendInstruction(OpCode.JMP, endLabel);
        chunk.appendInstruction(OpCode.LABEL, notTrueLabel);
        chunk.appendChunk(expr.expresisonIfFalse.accept(this));
        chunk.appendInstruction(OpCode.LABEL, endLabel);

        return chunk;
    }

    private visitUnaryExpression(expr:UnaryExpression) : ByteCodeInstruction[] {
        
        const chunk = this.createChunk();

        switch (expr.op.type)
        {
            case TokenType.NOT:
                {
                    chunk.appendChunk(expr.right.accept(this));

                    const isTrueLabel = this.reserveLabelId();
                    const endLabel = this.reserveLabelId();

                    chunk.appendInstruction(OpCode.JMPTRUE, isTrueLabel);

                    // If we're here it was false, so now it's true
                    chunk.appendInstruction(OpCode.CONST, this.ensureConst(new SmolBool(true)));
                    chunk.appendInstruction(OpCode.JMP, endLabel);
                    chunk.appendInstruction(OpCode.LABEL, isTrueLabel);

                    // If we're here it was true, so now it's false
                    chunk.appendInstruction(OpCode.CONST, this.ensureConst(new SmolBool(false)));
                    chunk.appendInstruction(OpCode.LABEL, endLabel);

                    break;
                }

            case TokenType.MINUS:

                chunk.appendInstruction(OpCode.CONST, this.ensureConst(new SmolNumber(0)));
                chunk.appendChunk(expr.right.accept(this));
                chunk.appendInstruction(OpCode.SUB);

                break;

        }

        return chunk;
    }

    private visitVariableExpression(expr:VariableExpression) : ByteCodeInstruction[] {
        
        const chunk = this.createChunk();

        chunk.appendInstruction(OpCode.FETCH, expr.name.lexeme);

        if (expr.prepostfixOp != undefined)
        {
            if (expr.prepostfixOp == TokenType.POSTFIX_INCREMENT)
            {
                chunk.appendInstruction(OpCode.FETCH, expr.name.lexeme);
                chunk.appendInstruction(OpCode.CONST, this.ensureConst(new SmolNumber(1)));
                chunk.appendInstruction(OpCode.ADD);
                chunk.appendInstruction(OpCode.STORE, expr.name.lexeme);
            }

            if (expr.prepostfixOp == TokenType.POSTFIX_DECREMENT)
            {
                chunk.appendInstruction(OpCode.FETCH, expr.name.lexeme);
                chunk.appendInstruction(OpCode.CONST, this.ensureConst(new SmolNumber(1)));
                chunk.appendInstruction(OpCode.SUB);
                chunk.appendInstruction(OpCode.STORE, expr.name.lexeme);
            }

            if (expr.prepostfixOp == TokenType.PREFIX_INCREMENT)
            {
                chunk.appendInstruction(OpCode.CONST, this.ensureConst(new SmolNumber(1)));
                chunk.appendInstruction(OpCode.ADD);
                chunk.appendInstruction(OpCode.STORE, expr.name.lexeme);
                chunk.appendInstruction(OpCode.FETCH, expr.name.lexeme);
            }

            if (expr.prepostfixOp == TokenType.PREFIX_DECREMENT)
            {
                chunk.appendInstruction(OpCode.CONST, this.ensureConst(new SmolNumber(1)));
                chunk.appendInstruction(OpCode.SUB);
                chunk.appendInstruction(OpCode.STORE, expr.name.lexeme);
                chunk.appendInstruction(OpCode.FETCH, expr.name.lexeme);
            }
        }

        return chunk;
    }
} 