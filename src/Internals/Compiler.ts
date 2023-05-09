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
import { Scanner } from "./Scanner";
import { Parser } from "./Parser";
import { SmolProgram } from "./SmolProgram";
import { SmolBool } from "./SmolVariableTypes/SmolBool";
import { TokenType } from "./TokenType";
import { SmolUndefined } from "./SmolVariableTypes/SmolUndefined";

declare global {
    // We do a lot of work with arrays/collections, so these convenience methods/extensions
    // help us keeep our code a little bit tidier
    interface Array<T> {
        appendChunk(elem: T):T;
        appendInstruction(opcode:OpCode, operand1?:any, operand2?:any):T;
        peek():T;
    }
  }
  
  if (!Array.prototype.appendChunk) {
    Array.prototype.appendChunk = function<ByteCodeInstruction>(this: ByteCodeInstruction[], elem: ByteCodeInstruction[]|ByteCodeInstruction):ByteCodeInstruction[] {
        if (elem instanceof Array<ByteCodeInstruction>) {
            (elem as ByteCodeInstruction[]).forEach(element => {
                this.push(element);
            });
        }
        else if (elem instanceof ByteCodeInstruction) {
            this.push(elem as ByteCodeInstruction);
        }
        else {
            throw new Error(`Can't append ${elem} to chunk`);
        }

        return this;
    }
  }

  if (!Array.prototype.appendInstruction) {
    Array.prototype.appendInstruction = function<ByteCodeInstruction>(this: ByteCodeInstruction[], opcode:OpCode, operand1?:any, operand2?:any):ByteCodeInstruction[] {
        var instr = new ByteCodeInstruction(opcode, operand1, operand2);
        this.push(instr as ByteCodeInstruction);
        return this;
    }
  }

  // This allows us to quickly access the last item of an array when we're using it as a stack
  if (!Array.prototype.peek) {
    Array.prototype.peek = function<T>(this: T[]):T {
        return this[this.length - 1];
    }
  }

class WhileLoop {
    startOfLoop:number;
    endOfLoop:number;

    constructor(startOfLoop:number, endOfLoop:number) {
        this.startOfLoop = startOfLoop;
        this.endOfLoop = endOfLoop;
    }
}

export class Compiler {

    private _function_table:SmolFunction[] = new Array<SmolFunction>();
    private _function_bodies:ByteCodeInstruction[][] = new Array<ByteCodeInstruction[]>();

    //private _code_sections:ByteCodeInstruction[][] = new Array<ByteCodeInstruction[]>();
    
    private _nextLabel:number = 1;

    // Labels for jumoing to are just numeric place holders. When a code gen section needs to
    // create a new jump-location, it can use this function
    private reserveLabelId():number
    {
        return this._nextLabel++;
    }

    // This is our structure to hold the constants that appear in source and need to be
    // referenced by the program (e.g., numbers, strings, bools). We define some here
    // so that a few common ones always have the same index.
    private _constants:SmolVariableType[] = [
        new SmolBool(true),
        new SmolBool(false)
    ];

    private _loopStack:Array<WhileLoop> = new Array<WhileLoop>();
    
    // This method can be called by any block that needs to create/reference a constant, either
    // getting the existing index of the value if we already have it, or inserting and returning
    // the new index 
    ensureConst(value:any) : number {
        var constIndex = this._constants.indexOf(value);

        if (constIndex == -1) {
            constIndex = this._constants.length;
            this._constants[constIndex] = value;
        }

        return constIndex;
    }

    public Compile(source:string) : SmolProgram {

        var t = Scanner.tokenize(source);
        var p = Parser.parse(t);

        var mainChunk = this.createChunk();

        for(var i = 0; i < p.length; i++) {
            mainChunk.appendChunk(p[i].accept(this));
        }

        let program = new SmolProgram();
        program.constants = this._constants;
        program.code_sections.push(mainChunk);

        return program;
    }

    // Short hand helper method to keep the code a little tidier 
    private createChunk() : ByteCodeInstruction[] {
        return new Array<ByteCodeInstruction>();
    }

    private visitBlockStatement(stmt:BlockStatement) : ByteCodeInstruction[] {

        var chunk = this.createChunk();

        chunk.appendInstruction(OpCode.ENTER_SCOPE);

        var outerThis = this;

        stmt.statements.forEach(function(blockStmt:Statement) {
            chunk.appendChunk(blockStmt.accept(outerThis));
        });

        chunk.appendInstruction(OpCode.LEAVE_SCOPE);

        return chunk;
    }

    private visitBreakStatement(stmt:BreakStatement) : ByteCodeInstruction {        
        return new ByteCodeInstruction(OpCode.LOOP_EXIT, this._loopStack.peek().startOfLoop);
    }

    private visitClassStatement(stmt:ClassStatement) : ByteCodeInstruction {

        stmt.functions.forEach(function(fn) {
        
            var function_index = this._function_bodies.length + 1;
            var function_name = `@${stmt.className.lexeme}.${fn.name.lexeme}`;

            this._function_table.push(new SmolFunction(
                function_name,
                function_index,
                fn.parameters.length,
                fn.parameters.map<string>((p) => p.lexeme)
            ));
    
            var body = this.createChunk();

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

        var chunk = this.createChunk();

        chunk.appendInstruction(OpCode.LOOP_EXIT, this._loopStack.peek().startOfLoop);

        return chunk;
    }

    private visitDebuggerStatement(stmt:DebuggerStatement) : ByteCodeInstruction[] {

        var chunk = this.createChunk();

        chunk.appendInstruction(OpCode.DEBUGGER);

        return chunk;
    }

    private visitExpressionStatement(stmt:ExpressionStatement) : ByteCodeInstruction[] {

        var chunk = this.createChunk();

        chunk.appendChunk(stmt.expression.accept(this));
        chunk.appendInstruction(OpCode.POP_AND_DISCARD);

        return chunk;
    }
    
    private visitFunctionStatement(stmt:FunctionStatement) : ByteCodeInstruction {

        let function_index = this._function_bodies.length + 1;
        let function_name = stmt.name.lexeme;

        this._function_table.push(new SmolFunction(
            function_name,
            function_index,
            stmt.parameters.length,
            stmt.parameters.map<string>((p) => p.lexeme)
        ));

        var body = this.createChunk();

        body.appendChunk(stmt.functionBody.accept(this));

        if (body.length == 0 || body.peek()._opcode != OpCode.RETURN)
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

        let chunk = this.createChunk();

        let notTrueLabel = this.reserveLabelId();

        chunk.appendChunk(stmt.expression.accept(this));

        chunk.appendInstruction(OpCode.JMPFALSE, notTrueLabel);

        chunk.appendChunk(stmt.thenStatement.accept(this));

        if (stmt.elseStatement == undefined)
        {
            chunk.appendInstruction(OpCode.LABEL, notTrueLabel);
        }
        else
        {
            let skipElseLabel = this.reserveLabelId();
            
            chunk.appendInstruction(OpCode.JMP, skipElseLabel);

            chunk.appendInstruction(OpCode.LABEL, notTrueLabel);

            chunk.appendChunk(stmt.elseStatement!.accept(this));

            chunk.appendInstruction(OpCode.LABEL, skipElseLabel);
        }

        return chunk;
    }

    private visitPrintStatement(stmt:PrintStatement) : ByteCodeInstruction[] {

        var chunk = this.createChunk();

        chunk.appendChunk(stmt.expression.accept(this));
        chunk.appendInstruction(OpCode.PRINT);

        return chunk;
    }

    private visitReturnStatement(stmt:ReturnStatement) : ByteCodeInstruction[] {

        var chunk = this.createChunk()

        if (stmt.expression != undefined)
        {
            chunk.appendChunk(stmt.expression.accept(this));
        }
        else
        {
            chunk.appendInstruction(OpCode.CONST, this.ensureConst(new SmolUndefined()));
        }

        chunk.appendInstruction(OpCode.RETURN);

        return chunk;
    }

    private visitTryStatement(stmt:TryStatement) : ByteCodeInstruction[] {

        return this.createChunk();
    }

    private visitThrowStatement(stmt:ThrowStatement) : ByteCodeInstruction[] {

        var chunk = this.createChunk();

        chunk.appendChunk(stmt.expression.accept(this));
        chunk.appendInstruction(OpCode.THROW);
        
        return chunk;
    }

    private visitVarStatement(stmt:VarStatement) : ByteCodeInstruction[] {

        var chunk = this.createChunk();

        chunk.appendInstruction(OpCode.DECLARE, stmt.name.lexeme);

        if (stmt.initializerExpression != undefined) {    
            chunk.appendChunk(stmt.initializerExpression.accept(this));
            chunk.appendInstruction(OpCode.STORE, stmt.name.lexeme);
        }

        return chunk;
    }

    private visitWhileStatement(stmt:WhileStatement) : ByteCodeInstruction[] {
        
        let chunk = this.createChunk();

        let startOfLoop = this.reserveLabelId();
        let endOfLoop = this.reserveLabelId();

        this._loopStack.push(new WhileLoop(startOfLoop, endOfLoop));

        chunk.appendInstruction(OpCode.LOOP_START);
        chunk.appendInstruction(OpCode.LABEL, startOfLoop);
        chunk.appendChunk(stmt.whileCondition.accept(this));
        chunk.appendInstruction(OpCode.JMPFALSE, endOfLoop);
        chunk.appendChunk(stmt.executeStatement.accept(this));
        chunk.appendInstruction(OpCode.JMP, startOfLoop);
        chunk.appendInstruction(OpCode.LABEL, endOfLoop);
        chunk.appendInstruction(OpCode.LOOP_END);

        this._loopStack.pop();

        return chunk;
    }


    private visitAssignExpression(expr:AssignExpression) : ByteCodeInstruction[] {

        return this.createChunk();
    }

    private visitBinaryExpression(expr:BinaryExpression) : ByteCodeInstruction[] {
        
        var chunk = this.createChunk();

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
        
        return this.createChunk();
    }

    private visitFunctionExpression(expr:FunctionExpression) : ByteCodeInstruction[] {

        return this.createChunk();
    }

    private visitGetExpression(expr:GetExpression) : ByteCodeInstruction[] {
        
        return this.createChunk();
    }

    private visitGroupingExpression(expr:GroupingExpression) : ByteCodeInstruction[]|ByteCodeInstruction {
        
        return expr.expr.accept(this);
    }

    private visitIndexerGetExpression(expr:IndexerGetExpression) : ByteCodeInstruction[] {
        
        return this.createChunk();
    }
    
    private visitIndexerSetExpression(expr:IndexerSetExpression) : ByteCodeInstruction[] {
    
        return this.createChunk();
    }

    private visitLiteralExpression(expr:LiteralExpression) : ByteCodeInstruction[] {
             
        var chunk = this.createChunk();

        var constIndex = this.ensureConst(expr.value);

        chunk.appendChunk(new ByteCodeInstruction(OpCode.CONST, constIndex));

        return chunk;
    }

    private visitLogicalExpression(expr:LogicalExpression) : ByteCodeInstruction[] {
        
        var chunk = this.createChunk();

        let shortcutLabel = this.reserveLabelId();
        let testCompleteLabel = this.reserveLabelId();

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

    private visitNewInstance(expr:NewInstanceExpression) : ByteCodeInstruction[] {
        
        return this.createChunk();
    }

    private visitObjectInitializer(expr:ObjectInitializerExpression) : ByteCodeInstruction[] {
        
        return this.createChunk();
    }

    private visitSetExpression(expr:SetExpression) : ByteCodeInstruction[] {
        
        return this.createChunk();
    }

    private visitTernaryExpression(expr:TernaryExpression) : ByteCodeInstruction[] {
        
        return this.createChunk();
    }

    private visitUnaryExpression(expr:UnaryExpression) : ByteCodeInstruction[] {
        
        return this.createChunk();
    }

    private visitVariableExpression(expr:VariableExpression) : ByteCodeInstruction[] {
        
        return this.createChunk();
    }
} 