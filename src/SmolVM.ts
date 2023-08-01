import { Compiler } from "./Internals/Compiler";
import { Environment } from "./Internals/Environment";
import { OpCode } from "./Internals/OpCode";
import { SmolProgram } from "./Internals/SmolProgram";
import { SmolStackType } from "./Internals/SmolStackTypes/SmolStackType";
import { SmolNativeFunctionResult } from "./Internals/SmolStackTypes/SmolNativeFunctionResult";
import { SmolFunction } from "./Internals/SmolVariableTypes/SmolFunction";
import { SmolObject } from "./Internals/SmolVariableTypes/SmolObject";
import { SmolVariableType } from "./Internals/SmolVariableTypes/SmolVariableType";
import { SmolUndefined } from "./Internals/SmolVariableTypes/SmolUndefined";
import { SmolCallSiteSaveState } from "./Internals/SmolStackTypes/SmolCallSiteSaveState";
import { SmolNumber } from "./Internals/SmolVariableTypes/SmolNumber";
import { SmolBool } from "./Internals/SmolVariableTypes/SmolBool";
import { SmolString } from "./Internals/SmolVariableTypes/SmolString";
import { SmolTryRegionSaveState } from "./Internals/SmolStackTypes/SmolTryRegionSaveState";
import { SmolLoopMarker } from "./Internals/SmolStackTypes/SmolLoopMarker";
import { ISmolNativeCallable } from "./Internals/SmolVariableTypes/ISmolNativeCallable";
import { SmolArray } from "./Internals/SmolVariableTypes/SmolArray";
import { RunMode } from "./Internals/RunMode";
import { SmolRegExp } from "./Internals/SmolVariableTypes/SmolRegExp";
import { SmolVariableCreator } from "./Internals/SmolVariableTypes/SmolVariableCreator";

export class SmolVM {

    program:SmolProgram;
    code_section = 0;
    pc = 0;
    runMode = RunMode.Paused;
    stack:SmolStackType[] = [];
    jmplocs:number[] = [];
    maxStackSize = -1;
    maxCycles = -1;

    globalEnv = new Environment();
    environment:Environment = this.globalEnv;
    // We're using any because we need to be able to call arbitrary functions on the type -- we might be able
    // to wrap this up in an interface.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    staticTypes:{ [name:string] : any } = {};

    classMethodRegEx = new RegExp("@([A-Za-z]+)[.]([A-Za-z]+)");

    constructor(source:string)
    {    
        const compiler = new Compiler();

        this.program = compiler.Compile(source);

        this.createStdLib();
        this.buildJumpTable();
    }

    static Compile(source:string):SmolVM {
        return new SmolVM(source);
    }

    static Init(source:string):SmolVM {
        const vm = SmolVM.Compile(source);
        vm.run();
        return vm;
    }

    // I have no idea how I could do this without any -- it really can return any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getGlobalVar(varName:string):any {
        return this.globalEnv.tryGet(varName)?.getValue() ?? undefined;
    }

    buildJumpTable()
    {
        // Loop through all labels in all code sections, capturing
        // the label number (always unique) and the location/index
        // in the instructions for that section so we can jump
        // if we need to.

        for (let i = 0; i < this.program.code_sections.length; i++)
        {
            // Not sure if this will hold up, might be too simplistic

            for (let j = 0; j < this.program.code_sections[i].length; j++)
            {
                const instr = this.program.code_sections[i][j];

                if (instr.opcode == OpCode.LABEL)
                {
                    // We're not storing anything about the section
                    // number but this should be ok becuase we should
                    // only ever jump inside the current section...
                    // Jumps to other sections are handled in a different
                    // way using the CALL instruction
                    this.jmplocs[instr.operand1 as number] = j;
                }
            }
        }        
    }

    createStdLib() {
        this.staticTypes['Object'] = SmolObject;
        this.staticTypes['String'] = SmolString;
        this.staticTypes['Array'] = SmolArray;
        this.staticTypes['RegExp'] = SmolRegExp;
    }
    
    decompile():string {
        return this.program.decompile();
    }

    private externalMethods:{ [string: string] : Function } = {};
    
    registerMethod(methodName:string, closure:Function) {
        // console.log(`type = ${typeof closure}`); // function

        this.externalMethods[methodName] = closure;
    }

    callExternalMethod(methodName:string, numberOfPassedArgs:number) {

        let methodArgs:any[] = [];

        for (var i = 0; i < numberOfPassedArgs; i++)
        {        
            var value = this.stack.pop() as SmolVariableType;

            methodArgs.push(value.getValue());
        }

        var returnValue = this.externalMethods[methodName].apply(null, methodArgs);

        if (typeof returnValue == "undefined")
        {
            return new SmolUndefined();
        }
        else
        {
            return SmolVariableCreator.create(returnValue);
        }
    }

    call(functionName:string, ...args: any[]) : undefined {
        if (this.runMode != RunMode.Done)
        {
            throw new Error("Init() should be used before calling a function, to ensure the vm state is prepared");
        }

        // Let the VM know that it's ok to proceed from wherever the PC was pointing next
        this.runMode = RunMode.Paused;

        // Store the current state. This doesn't matter too much, because it shouldn't really
        // be runnable after we're done, but it doesn't hurt to do this.
        var state = new SmolCallSiteSaveState(
            this.code_section,
            this.pc,
            this.environment,
            true
        );

        // Create an environment for the function
        var env = new Environment(this.globalEnv);
        this.environment = env;

        var fnIndex = -1;

        for(var i = 0; i <  this.program.function_table.length; i++) {
            if (this.program.function_table[i].global_function_name == functionName) {
                fnIndex = i;
                break;
            }
        }

        if (i == -1) {
            throw new Error(`Could not find a function named '${functionName}'`);
        }

        var fn = this.program.function_table[i];


        // Prime the new environment with variables for
        // the parameters in the function declaration (actual number
        // passed might be different)

        for (var i = 0; i < fn.arity; i++)
        {
            if (args.length > i)
            {
                env.define(fn.param_variable_names[i], SmolVariableCreator.create(args[i]));
            }
            else
            {
                env.define(fn.param_variable_names[i], new SmolUndefined());
            }
        }


        this.stack.push(state!);

        this.pc = 0;
        this.code_section = fn.code_section;

        this.run();

        var returnValue = this.stack.pop();

        return (returnValue as SmolVariableType).getValue();
    }

    // I have no idea how I could do this without Function, it's needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private debugFunc:((str:string) => void)|undefined = undefined;

    set onDebugPrint (debugFunc:(str:string) => void) {
        this.debugFunc = debugFunc;
    }

    debug(str:string):void {
        if (this.debugFunc != undefined) this.debugFunc(str);
    }
    
    run():void {
        this._run(RunMode.Run);
    }

    step():void {
        this._run(RunMode.Step);
    }

    _run(newRunMode:RunMode)
    {
        this.runMode = newRunMode;
        let hasExecutedAtLeastOnce = false; // Used to ensure Step-through trips after at least one instruction is executed
        let consumedCycles = 0;

        while (this.runMode == RunMode.Run || this.runMode == RunMode.Step)
        {        
            // Peek at the next instruction to execute and see if it's a step break point
            if (this.runMode == RunMode.Step
                    && this.program.code_sections[this.code_section][this.pc].isStatementStartpoint
                    && hasExecutedAtLeastOnce)
            {
                this.runMode = RunMode.Paused;
                return;
            }

            // Fetch the next instruciton and advance the program counter
            const instr = this.program.code_sections[this.code_section][this.pc++];
            
            this.debug(OpCode[instr.opcode]);
            //this.debug(this.stack.length.toString());
            //this.debug(this.stack.map<string>((el) => el.toString()).join(', '));

            try
            {
                switch (instr.opcode)
                {
                    case OpCode.NOP:
                    case OpCode.START:
                        // Just skip over this instruction, no-op
                        break;

                    case OpCode.CONST:
                        // Load a value from the data section at specified index
                        // and place it on the stack
                        this.stack.push(this.program.constants[instr.operand1 as number]);
                        this.debug(`              [Loaded Const ${this.program.constants[instr.operand1 as number].toString()}]`);

                        break;

                    case OpCode.CALL:
                        {
                            const untypedCallData = this.stack.pop();

                            if (untypedCallData instanceof SmolNativeFunctionResult)
                            {
                                // Everything was handled by the previous Fetch instruction, which made a native
                                // call and left the result on the stack.
                                break;
                            }

                            const callData = untypedCallData as SmolFunction;

                            // First create the env for our function

                            let env = new Environment(this.globalEnv);

                            if (instr.operand2 as boolean)
                            {
                                // If op2 is true, that means we're calling a method
                                // on an object/class, so we need to get the objref
                                // (from the next value on the stack) and use that
                                // objects environment instead.

                                env = (this.stack.pop() as SmolObject).object_env;
                            }

                            // Next pop args off the stack. Op1 is number of args.                    

                            const paramValues:SmolVariableType[] = new Array<SmolVariableType>();

                            for (let i = 0; i < (instr.operand1 as number); i++)
                            {
                                paramValues.push(this.stack.pop() as SmolVariableType);
                            }

                            // Now prime the new environment with variables for
                            // the parameters in the function declaration (actual number
                            // passed might be different)

                            for (let i = 0; i < callData.arity; i++)
                            {
                                if (paramValues.length > i)
                                {
                                    env.define(callData.param_variable_names[i], paramValues[i]);
                                }
                                else
                                {
                                    env.define(callData.param_variable_names[i], new SmolUndefined());
                                }
                            }

                            // Store our current program/vm state so we can restor

                            const state = new SmolCallSiteSaveState(
                                this.code_section,
                                this.pc,
                                this.environment,
                                false // call is extern
                            );

                            // Switch the active env in the vm over to the one we prepared for the call

                            this.environment = env;

                            this.stack.push(state);

                            // Finally set our PC to the start of the function we're about to execute

                            this.pc = 0;
                            this.code_section = callData.code_section;

                            break;
                        }

                    case OpCode.ADD:
                        {
                            const right = this.stack.pop() as SmolVariableType;
                            const left = this.stack.pop() as SmolVariableType;

                            if (left instanceof SmolNumber && right instanceof SmolNumber) {
                                this.stack.push(new SmolNumber(left.getValue() + right.getValue()));
                            }
                            else {
                                this.stack.push(new SmolString(left.getValue().toString() + right.getValue().toString()));
                            }
                            
                            break;
                        }

                    case OpCode.SUB:
                        {
                            const right = this.stack.pop() as SmolVariableType;
                            const left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolNumber(left.getValue() - right.getValue()));

                            break;
                        }

                    case OpCode.MUL:
                        {
                            const right = this.stack.pop() as SmolVariableType;
                            const left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolNumber(left.getValue() * right.getValue()));

                            break;
                        }

                    case OpCode.DIV:
                        {
                            const right = this.stack.pop() as SmolVariableType;
                            const left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolNumber(left.getValue() / right.getValue()));

                            break;
                        }

                    case OpCode.REM:
                        {
                            const right = this.stack.pop() as SmolVariableType;
                            const left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolNumber(left.getValue() % right.getValue()));

                            break;
                        }

                    case OpCode.POW:
                        {
                            const right = this.stack.pop() as SmolVariableType;
                            const left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolNumber(left.getValue() ** right.getValue()));

                            break;
                        }


                    case OpCode.EQL:
                        {
                            const right = this.stack.pop() as SmolVariableType;
                            const left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolBool(left.equals(right)));

                            break;
                        }

                    case OpCode.NEQ:
                        {
                            const right = this.stack.pop() as SmolVariableType;
                            const left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolBool(!left.equals(right)));

                            break;
                        }

                    case OpCode.GT:
                        {
                            const right = this.stack.pop() as SmolVariableType;
                            const left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolBool(left.getValue() > right.getValue()));

                            break;
                        }

                    case OpCode.LT:
                        {
                            const right = this.stack.pop() as SmolVariableType;
                            const left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolBool(left.getValue() < right.getValue()));

                            break;
                        }

                    case OpCode.GTE:
                        {
                            const right = this.stack.pop() as SmolVariableType;
                            const left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolBool(left.getValue() >= right.getValue()));

                            break;
                        }

                    case OpCode.LTE:
                        {
                            const right = this.stack.pop() as SmolVariableType;
                            const left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolBool(left.getValue() <= right.getValue()));

                            break;
                        }

                    case OpCode.BITWISE_OR:
                        {
                            const right = this.stack.pop() as SmolVariableType;
                            const left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolNumber(left.getValue() | right.getValue()));

                            break;
                        }

                    case OpCode.BITWISE_AND:
                        {
                            const right = this.stack.pop() as SmolVariableType;
                            const left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolNumber(left.getValue() & right.getValue()));

                            break;
                        }

                    case OpCode.EOF:
                        {
                            //console.log(`Done, stack size = ${this.stack.length}, consumed cycles = ${consumedCycles}`);
                            this.runMode = RunMode.Done;
                            return;
                        }

                    case OpCode.RETURN:
                        {
                            // Return to the previous code section, putting
                            // a return value on the stack and restoring the PC

                            // Top value on the stack is the return value

                            const return_value = this.stack.pop();

                            // Next value should be the original pre-call state that we saved

                            const _savedCallState = this.stack.pop();

                            if (!(_savedCallState instanceof SmolCallSiteSaveState))
                            {
                                throw new Error("Tried to return but found something unexecpted on the stack");
                            }

                            const savedCallState = _savedCallState as SmolCallSiteSaveState;

                            this.environment = savedCallState.previous_env;
                            this.pc = savedCallState.pc;
                            this.code_section = savedCallState.code_section;

                            // Return value needs to go back on the stack
                            this.stack.push(return_value == undefined ? new SmolUndefined() : return_value);

                            if (savedCallState.call_is_extern)
                            {
                                // Not sure what to do about return value here

                                this.runMode = RunMode.Paused;
                                return; // Don't like this, error prone
                            }

                            break;
                        }
                    case OpCode.DECLARE:
                        this.environment.define(instr.operand1 as string, new SmolUndefined());
                        break;

                    case OpCode.STORE:
                        {
                            let name = instr.operand1 as string;

                            //console.log(name);
                            //console.log(this.stack);

                            if (name == "@IndexerSet")
                            {
                                // Special case for square brackets!

                                // Not sure about this cast, might need to add an extra check for type

                                name = (this.stack.pop() as SmolVariableType).getValue();
                            }

                            const value = this.stack.pop() as SmolVariableType; // Hopefully always true...
                            
                            let env_in_context = this.environment;
                            let isPropertySetter = false;

                            if (instr.operand2 != undefined && (instr.operand2 as boolean))
                            {
                                //console.log(this.stack);

                                const objRef = this.stack.pop();

                                isPropertySetter = true;

                                if (objRef instanceof SmolObject)
                                {
                                    env_in_context = (objRef as SmolObject).object_env;
                                }
                                else if (objRef instanceof ISmolNativeCallable)
                                {
                                    (objRef as ISmolNativeCallable).setProp(name, value);
                                    break;
                                }
                                else
                                {
                                    throw new Error(`${objRef} is not a valid target for this call`);
                                }
                            }

                            env_in_context.assign(name, value, isPropertySetter);

                            this.debug(`              [Saved ${(value as SmolVariableType).toString()}]`);

                            break;
                        }

                    case OpCode.FETCH:
                        {
                            // Could be a variable or a function
                            let name = instr.operand1 as string;

                            //console.log(name);
                            //console.log(this.stack);

                            let env_in_context = this.environment;
                            
                            // WARNING -- Difference heere between .net and ts versions and I can't remember why .net was changed :(
                            // TODO: Check why the difference and fix...           
                            if (name == "@IndexerGet" || name == "@IndexerSet")
                            {
                                // Special case for square brackets!

                                name = (this.stack.pop() as SmolVariableType).getValue().toString();
                            }

                            if (instr.operand2 != null && (instr.operand2 as boolean))
                            {

                                const objRef = this.stack.pop();
                                const peek_instr = this.program.code_sections[this.code_section][this.pc];

                                if (objRef instanceof SmolObject)
                                {
                                    env_in_context = (objRef as SmolObject).object_env;

                                    if (peek_instr.opcode == OpCode.CALL && (peek_instr.operand2 as boolean))
                                    {
                                        this.stack.push(objRef);
                                    }
                                }
                                else
                                {                                
                                    if (objRef instanceof ISmolNativeCallable)
                                    {
                                        const isFuncCall = (peek_instr.opcode == OpCode.CALL && peek_instr.operand2);

                                        if (isFuncCall)
                                        {
                                            // We need to get some arguments

                                            const paramValues = new Array<SmolVariableType>();

                                            for (let i = 0; i < (peek_instr.operand1 as number); i++)
                                            {
                                                paramValues.push(this.stack.pop() as SmolVariableType);
                                            }

                                            this.stack.push((objRef as ISmolNativeCallable).nativeCall(name, paramValues));
                                            this.stack.push(new SmolNativeFunctionResult()); // Call will use this to see that the call is already done.
                                        }
                                        else
                                        {
                                            // For now won't work with Setter

                                            this.stack.push((objRef as ISmolNativeCallable).getProp(name));
                                        }

                                        break;
                                    }
                                    else if (objRef instanceof SmolNativeFunctionResult)
                                    {                                                                         
                                        if (this.classMethodRegEx.test(name))
                                        {
                                            const rexResult = this.classMethodRegEx.exec(name);

                                            //console.log(rexResult);

                                            if (rexResult == null) {
                                                throw new Error("class method name regex failed");
                                            }

                                            // TODO: Document why this is any and why the first
                                            // value is the regex second group match
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            //const parameters:any[] = [rexResult[2]];

                                            const functionName = rexResult[2] as string;

                                            const functionArgs:SmolVariableType[] = [];

                                            if (name != "@Object.constructor")
                                            {
                                                for (let i = 0; i < (peek_instr.operand1 as number); i++)
                                                {
                                                    functionArgs.push(this.stack.pop() as SmolVariableType);
                                                }

                                                if ((peek_instr.operand1 as number) > 0)
                                                {
                                                    //parameters.push(functionArgs);
                                                }
                                            }

                                            // Now we've got rid of the params we can get rid
                                            // of the dummy object that create_object left
                                            // on the stack

                                            this.stack.pop();

                                            // Put our actual new object on after calling the ctor:                                            
                                            const r = this.staticTypes[rexResult[1]]["staticCall"](functionName, functionArgs) as SmolVariableType;
                                            
                                            if (name == "@Object.constructor")
                                            {
                                                // Hack alert!!!
                                                (r as SmolObject).object_env = new Environment(this.globalEnv);
                                            }

                                            this.stack.push(r);

                                            // And now fill in some fake object refs again:
                                            this.stack.push(new SmolNativeFunctionResult()); // Call will use this to see that the call is already done.
                                            this.stack.push(new SmolNativeFunctionResult()); // Pop and Discard following Call will discard this

                                            break;
                                        }

                                    }
                                    else
                                    {
                                        throw new Error(`${objRef} is not a valid target for this call`);
                                    }
                                }                    
                            }

                            let fetchedValue = env_in_context.tryGet(name);

                            if (fetchedValue instanceof SmolFunction)
                            {
                                fetchedValue = fetchedValue as SmolFunction;
                            }

                            if (fetchedValue != null)
                            {
                                this.stack.push(fetchedValue as SmolStackType);

                                this.debug(`              [Loaded ${(fetchedValue as SmolVariableType).getValue()}]`);
                            }
                            else
                            {
                                const fn = this.program.function_table.find(f => f.global_function_name == name);
                                
                                if (fn != undefined) {
                                    this.stack.push(fn);
                                }
                                else if (this.externalMethods[name] != undefined) {
                                    const peek_instr = this.program.code_sections[this.code_section][this.pc];

                                    this.stack.push(this.callExternalMethod(name, peek_instr.operand1 as number));

                                    this.stack.push(new SmolNativeFunctionResult());
                                }
                                else {
                                    this.stack.push(new SmolUndefined());
                                }
                            }

                            break;
                        }

                    case OpCode.JMPFALSE:
                        {
                            const value = (this.stack.pop() as SmolVariableType);

                            if (value.getValue() == false) // .isFalsey())
                            {
                                this.pc = this.jmplocs[instr.operand1 as number];
                            }

                            break;
                        }

                    case OpCode.JMPTRUE:
                        {
                            //.IsTruthy())
                            const value = this.stack.pop() as SmolVariableType;

                            if (value.getValue() == true) // .isFalsey())
                            {
                                this.pc = this.jmplocs[instr.operand1 as number];
                            }                         

                            break;
                        }

                    case OpCode.JMP:
                        this.pc = this.jmplocs[instr.operand1 as number];
                        break;

                    case OpCode.LABEL:
                        // Just skip over this instruction, it's only here
                        // to support branching
                        break;

                    case OpCode.ENTER_SCOPE:
                        {
                            this.environment = new Environment(this.environment);
                            break;
                        }

                    case OpCode.LEAVE_SCOPE:
                        {

                            this.environment = this.environment.enclosing as Environment;
                            break;
                        }

                    case OpCode.DEBUGGER:
                        {
                            this.runMode = RunMode.Paused;
                            return;
                        }

                    case OpCode.POP_AND_DISCARD:
                        // operand1 is optional bool, default true means fail if nothing to pop
                        if (this.stack.length > 0 || instr.operand1 == null || (instr.operand1 as boolean))
                        {
                            this.stack.pop();
                        }
                        break;

                    case OpCode.TRY:
/*
                        SmolVariableType? exception = null;

                        if (instr.operand2 != null && (bool)instr.operand2)
                        {
                            // This is a special flag for the try instruction that tells us to
                            // take the exception that's already on the stack and leave it at the
                            // top after creating the try checkpoint.

                            exception = (SmolVariableType)stack.Pop();
                        }

                        stack.Push(new SmolTryRegionSaveState(
                                code_section: this.code_section,
                                PC: this.PC,
                                this_env: this.environment,
                                jump_exception: jmplocs[(int)instr.operand1!]
                            )
                        );

                        if (exception != null)
                        {
                            stack.Push(exception!);
                        }
*/
                        break;

                    case OpCode.THROW:
                        /*
                        if (instr.operand1 as bool? ?? false) // This flag means the user provided an object to throw, and it's already on the stack
                        {
                            throw new SmolThrown(); // SmolRuntimeException("");
                        }
                        else
                        {
                            //stack.Push(new SmolValue()

                            throw new SmolThrown();  // throw new SmolRuntimeException();
                        }
                        */
                       break;

                    case OpCode.LOOP_START:

                        this.stack.push(new SmolLoopMarker(this.environment));

                        break;

                    case OpCode.LOOP_END:

                        this.stack.pop();
                        break;

                    case OpCode.LOOP_EXIT:

                        while (this.stack.length > 0)
                        {
                            const next = this.stack.pop();

                            if (next instanceof SmolLoopMarker)
                            {
                                this.environment = (next as SmolLoopMarker).current_env;

                                this.stack.push(next); // Needs to still be on the stack

                                if (instr.operand1 != undefined)
                                {
                                    this.pc = this.jmplocs[instr.operand1 as number];
                                }

                                break;
                            }
                        }

                        break;

                    case OpCode.CREATE_OBJECT:
                        {
                            // Create a new environment and store it as an instance/ref variable
                            // For now we'll just have it 'inherit' the global env, but scope is
                            // a thing we need to think about, but I'll work out how JS does it
                            // first and try and do the same (I think class hierarchies all share
                            // a single env?!

                            const class_name = instr.operand1 as string;

                            if (this.staticTypes[class_name] != undefined)
                            {
                                this.stack.push(new SmolNativeFunctionResult());
                                break;
                            }

                            const obj_environment = new Environment(this.globalEnv);
                            
                            this.program.function_table.filter((el) => el.global_function_name.startsWith(`@${class_name}.`)).forEach(classFunc => {
                                                        
                                const funcName = classFunc.global_function_name.substring(class_name.length + 2);

                                obj_environment.define(funcName, new SmolFunction(
                                    classFunc.global_function_name,
                                    classFunc.code_section,
                                    classFunc.arity,
                                    classFunc.param_variable_names
                                ));

                            });

                            this.stack.push(new SmolObject(obj_environment, class_name));

                            obj_environment.define("this", (this.stack.peek() as SmolVariableType));

                            break;
                        }

                    case OpCode.DUPLICATE_VALUE:
                        {
                            const skip = instr.operand1 != undefined ? (instr.operand1 as number) : 0;

                            const itemToDuplicate = this.stack[this.stack.length - 1 - skip];

                            this.stack.push(itemToDuplicate);

                            break;
                        }
                    case OpCode.PRINT:
                        {
                            const valueToPrint = this.stack.pop() as SmolVariableType;

                            console.log(valueToPrint.getValue());

                            break;
                        }

                    default:
                        throw new Error(`You forgot to handle an opcode: ${instr.opcode}`);
                }
            }
            catch (e) // SmolThrown
            {
                let handled = false;
                const thrownObject = this.stack.pop() as SmolVariableType;

                while (this.stack.length > 0)
                {
                    const next = this.stack.pop();

                    if (next instanceof SmolTryRegionSaveState)
                    {
                        // We found the start of a try section, restore our state and jump to the exception handler location

                        const tryState = next as SmolTryRegionSaveState;

                        this.code_section = tryState.code_section;
                        this.pc = tryState.jump_exception;
                        this.environment = tryState.this_env;

                        this.stack.push(thrownObject);

                        handled = true;
                        break;
                    }
                }

                if (!handled)
                {
                    throw e //SmolRuntimeException(e.Message);
                }

            }/*
            catch (Exception e) // (SmolRuntimeException e)
            {
                bool handled = false;
              
                while (stack.Any())
                {
                    var next = stack.Pop();

                    if (next.GetType() == typeof(SmolTryRegionSaveState))
                    {
                        // We found the start of a try section, restore our state and jump to the exception handler location

                        var state = (SmolTryRegionSaveState)next;

                        this.code_section = state.code_section;
                        this.PC = state.jump_exception;
                        this.environment = state.this_env;

                        stack.Push(new SmolError(e.Message));

                        handled = true;
                        break;
                    }
                }

                if (!handled)
                {
                    throw new SmolRuntimeException(e.Message, e);
                }
            }
            */

            if (this.maxStackSize > -1 && this.stack.length > this.maxStackSize) throw new Error("Stack overflow");

            hasExecutedAtLeastOnce = true;

            consumedCycles += 1;

            if (this.maxCycles > -1 && consumedCycles > this.maxCycles) throw new Error("Too many cycles");
        }
    }
}