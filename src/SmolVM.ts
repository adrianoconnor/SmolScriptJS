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

enum RunMode
{
    Run,
    Paused,
    Step,
    Done
}

export class SmolVM {

    program:SmolProgram;
    code_section:number = 0;
    pc:number = 0;
    runMode:RunMode = RunMode.Paused;
    stack:SmolStackType[] = new Array<SmolStackType>();
    jmplocs:number[] = new Array<number>();

    globalEnv:Environment = new Environment();
    environment:Environment = this.globalEnv;
    staticTypes:{ [name:string] : any } = {};

    constructor(source:string)
    {    
        let compiler = new Compiler();

        this.program = compiler.Compile(source);

        this.createStdLib();
        this.buildJumpTable();
    }

    static Compile(source:string):SmolVM {
        return new SmolVM(source);
    }

    static Init(source:string):SmolVM {
        let vm = SmolVM.Compile(source);
        vm.run();
        return vm;
    }

    getGlobalVar(varName:string):any {
        return this.globalEnv.tryGet(varName)?.getValue() ?? undefined;
    }

    buildJumpTable()
    {
        // Loop through all labels in all code sections, capturing
        // the label number (always unique) and the location/index
        // in the instructions for that section so we can jump
        // if we need to.

        for (let i:number = 0; i < this.program.code_sections.length; i++)
        {
            // Not sure if this will hold up, might be too simplistic

            for (let j:number = 0; j < this.program.code_sections[i].length; j++)
            {
                let instr = this.program.code_sections[i][j];

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
        this.staticTypes['String'] = SmolString;
        this.staticTypes['Array'] = SmolArray;
    }
    
    decompile():string {
        return this.program.decompile();
    }

    private debugFunc:Function|undefined = undefined;

    onDebugPrint(debugFunc:Function):void {
        this.debugFunc = debugFunc;
    }

    debug(str:String):void {
        if (this.debugFunc != undefined) this.debugFunc(str);
    }
    
    run():void {
        this._run(RunMode.Run);
    }

    _run(newRunMode:RunMode)
    {
        this.runMode = newRunMode;

        while (true)
        {        
            var instr = this.program.code_sections[this.code_section][this.pc++];
            
            //this.debug(OpCode[instr.opcode]);
            //this.debug(this.stack.length.toString());
            //this.debug(this.stack.map<string>((el) => el.toString()).join(', '));

            try
            {
                switch (instr.opcode)
                {
                    case OpCode.NOP:
                        // Just skip over this instruction, no-op
                        break;

                    case OpCode.CONST:
                        // Load a value from the data section at specified index
                        // and place it on the stack
                        this.stack.push(this.program.constants[instr.operand1 as number]);

                        break;

                    case OpCode.CALL:
                        {
                            var untypedCallData = this.stack.pop();

                            if (untypedCallData instanceof SmolNativeFunctionResult)
                            {
                                // Everything was handled by the previous Fetch instruction, which made a native
                                // call and left the result on the stack.
                                break;
                            }

                            let callData = untypedCallData as SmolFunction;

                            // First create the env for our function

                            var env = new Environment(this.globalEnv);

                            if (instr.operand2 as boolean)
                            {
                                // If op2 is true, that means we're calling a method
                                // on an object/class, so we need to get the objref
                                // (from the next value on the stack) and use that
                                // objects environment instead.

                                env = (this.stack.pop() as SmolObject).object_env;
                            }

                            // Next pop args off the stack. Op1 is number of args.                    

                            let paramValues:SmolVariableType[] = new Array<SmolVariableType>();

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

                            var state = new SmolCallSiteSaveState(
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
                            let right = this.stack.pop() as SmolVariableType;
                            let left = this.stack.pop() as SmolVariableType;

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
                            var right = this.stack.pop() as SmolVariableType;
                            var left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolNumber(left.getValue() - right.getValue()));

                            break;
                        }

                    case OpCode.MUL:
                        {
                            var right = this.stack.pop() as SmolVariableType;
                            var left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolNumber(left.getValue() * right.getValue()));

                            break;
                        }

                    case OpCode.DIV:
                        {
                            var right = this.stack.pop() as SmolVariableType;
                            var left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolNumber(left.getValue() / right.getValue()));

                            break;
                        }

                    case OpCode.REM:
                        {
                            var right = this.stack.pop() as SmolVariableType;
                            var left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolNumber(left.getValue() % right.getValue()));

                            break;
                        }

                    case OpCode.POW:
                        {
                            var right = this.stack.pop() as SmolVariableType;
                            var left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolNumber(left.getValue() ** right.getValue()));

                            break;
                        }


                    case OpCode.EQL:
                        {
                            var right = this.stack.pop() as SmolVariableType;
                            var left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolBool(left.equals(right)));

                            break;
                        }

                    case OpCode.NEQ:
                        {
                            var right = this.stack.pop() as SmolVariableType;
                            var left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolBool(!left.equals(right)));

                            break;
                        }

                    case OpCode.GT:
                        {
                            var right = this.stack.pop() as SmolVariableType;
                            var left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolBool(left.getValue() > right.getValue()));

                            break;
                        }

                    case OpCode.LT:
                        {
                            var right = this.stack.pop() as SmolVariableType;
                            var left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolBool(left.getValue() < right.getValue()));

                            break;
                        }

                    case OpCode.GTE:
                        {
                            var right = this.stack.pop() as SmolVariableType;
                            var left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolBool(left.getValue() >= right.getValue()));

                            break;
                        }

                    case OpCode.LTE:
                        {
                            var right = this.stack.pop() as SmolVariableType;
                            var left = this.stack.pop() as SmolVariableType;

                            this.stack.push(new SmolBool(left.getValue() <= right.getValue()));

                            break;
                        }
/*
Don't need this right now :)
                    case OpCode.BITWISE_OR:
                        {
                            var right = this.stack.pop() as SmolVariableType;
                            var left = this.stack.pop() as SmolVariableType;

                            stack.Push(left | right);

                            break;
                        }

                    case OpCode.BITWISE_AND:
                        {
                            var right = this.stack.pop() as SmolVariableType;
                            var left = this.stack.pop() as SmolVariableType;

                            stack.Push(left & right);

                            break;
                        }
*/
                    case OpCode.EOF:

                        //debug($"Done, stack size = {stack.Count}");
                        this.runMode = RunMode.Done;
                        return;

                    case OpCode.RETURN:

                        // Return to the previous code section, putting
                        // a return value on the stack and restoring the PC

                        // Top value on the stack is the return value

                        let return_value = this.stack.pop();

                        // Next value should be the original pre-call state that we saved

                        let _savedCallState = this.stack.pop();

                        if (!(_savedCallState instanceof SmolCallSiteSaveState))
                        {
                            throw new Error("Tried to return but found something unexecpted on the stack");
                        }

                        let savedCallState:SmolCallSiteSaveState = _savedCallState as SmolCallSiteSaveState;

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

                    case OpCode.DECLARE:
                        this.environment.define(instr.operand1 as string, new SmolUndefined());
                        break;

                    case OpCode.STORE:
                        {
                            var name = instr.operand1 as string;

                            if (name == "@IndexerSet")
                            {
                                // Special case for square brackets!

                                // Not sure abotu this cast, might need to add an extra check for type

                                name = (this.stack.pop() as SmolVariableType).getValue();
                            }

                            let value = this.stack.pop() as SmolVariableType; // Hopefully always true...
                            
                            let env_in_context = this.environment;
                            let isPropertySetter:boolean = false;

                            if (instr.operand2 != undefined && (instr.operand2 as boolean))
                            {
                                //console.log(this.stack);

                                var objRef = this.stack.pop();

                                isPropertySetter = true;

                                if (objRef instanceof SmolObject)
                                {
                                    env_in_context = (objRef as SmolObject).object_env;
                                }
                                else if (objRef instanceof ISmolNativeCallable)
                                {
                                    (objRef as ISmolNativeCallable).setProp(name!, value);
                                    break;
                                }
                                else
                                {
                                    throw new Error(`${objRef} is not a valid target for this call`);
                                }
                            }

                            env_in_context.assign(name!, value, isPropertySetter);

                            this.debug(`              [Saved ${value}]`);

                            break;
                        }

                    case OpCode.FETCH:
                        {
                            // Could be a variable or a function
                            var name = instr.operand1 as string;

                            var env_in_context = this.environment;

                            if (name == "@IndexerGet")
                            {
                                // Special case for square brackets!

                                name = (this.stack.pop() as SmolVariableType).getValue().toString();
                            }

                            if (instr.operand2 != null && (instr.operand2 as boolean))
                            {

                                var objRef = this.stack.pop();
                                var peek_instr = this.program.code_sections[this.code_section][this.pc];

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
                                        var isFuncCall = (peek_instr.opcode == OpCode.CALL && peek_instr.operand2);

                                        if (isFuncCall)
                                        {
                                            // We need to get some arguments

                                           let paramValues = new Array<SmolVariableType>();

                                            for (let i = 0; i < (peek_instr.operand1 as number); i++)
                                            {
                                                paramValues.push(this.stack.pop() as SmolVariableType);
                                            }

                                            this.stack.push((objRef as ISmolNativeCallable).nativeCall(name, paramValues)!);
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
                                        var classMethodRegEx = new RegExp("\@([A-Za-z]+)[\.]([A-Za-z]+)");

                                        if (classMethodRegEx.test(name))
                                        {
                                            var rexResult = classMethodRegEx.exec(name);

                                            if (rexResult == null || rexResult!.groups == null) {
                                                throw new Error("class method name regex failed");
                                            }

                                            let parameters:any[] = new Array<any>();

                                            parameters.push(rexResult.groups[2]);

                                            var functionArgs = new Array<SmolVariableType>();

                                            if (name != "@Object.constructor")
                                            {
                                                for (let i = 0; i < (peek_instr.operand1 as number); i++)
                                                {
                                                    functionArgs.push(this.stack.pop() as SmolVariableType);
                                                }
                                            }

                                            parameters.push(functionArgs);

                                            // Now we've got rid of the params we can get rid
                                            // of the dummy object that create_object left
                                            // on the stack

                                            this.stack.pop();

                                            // Put our actual new object on after calling the ctor:                                            
                                            var r = this.staticTypes[rexResult.groups[1]]["StaticCall"](parameters) as SmolVariableType;
                                            
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

                            var fetchedValue = env_in_context.tryGet(name);

                            if (fetchedValue instanceof SmolFunction)
                            {
                                fetchedValue = fetchedValue as SmolFunction;
                            }

                            if (fetchedValue != null)
                            {
                                this.stack.push(fetchedValue as SmolStackType);

                                this.debug(`              [Loaded ${fetchedValue} ${(fetchedValue as SmolVariableType).getValue()}]`);
                            }
                            else
                            {
                                var fn = this.program.function_table.find(f => f.global_function_name == name);
                                
                                if (fn != undefined)
                                {
                                    this.stack.push(fn);
                                }
                                else
                                {
                                    this.stack.push(new SmolUndefined());
                                }
                            }

                            break;
                        }

                    case OpCode.JMPFALSE:
                        {
                            var value = (this.stack.pop() as SmolVariableType);

                            if (value.getValue() == false) // .isFalsey())
                            {
                                this.pc = this.jmplocs[instr.operand1 as number];
                            }

                            break;
                        }

                    case OpCode.JMPTRUE:

                        //.IsTruthy())
                        var value = (this.stack.pop() as SmolVariableType);

                        if (value.getValue() == true) // .isFalsey())
                        {
                            this.pc = this.jmplocs[instr.operand1 as number];
                        }                         

                        break;


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
                            var next = this.stack.pop();

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

                        // Create a new environment and store it as an instance/ref variable
                        // For now we'll just have it 'inherit' the global env, but scope is
                        // a thing we need to think about, but I'll work out how JS does it
                        // first and try and do the same (I think class hierarchies all share
                        // a single env?!

                        var class_name = instr.operand1 as string;

                        if (this.staticTypes[class_name] != undefined)
                        {
                            this.stack.push(new SmolNativeFunctionResult());
                            break;
                        }

                        var obj_environment = new Environment(this.globalEnv);
                        
                        this.program.function_table.filter((el) => el.global_function_name.startsWith(`@${class_name}.`)).forEach(classFunc => {
                                                    
                            var funcName = classFunc.global_function_name.substring(class_name.length + 2);

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

                    case OpCode.DUPLICATE_VALUE:

                        let skip:number = instr.operand1 != undefined ? (instr.operand1 as number) : 0;

                        var itemToDuplicate = this.stack[this.stack.length - 1 - skip];

                        this.stack.push(itemToDuplicate);

                        break;

                    case OpCode.PRINT:

                        var whatevs = this.stack.pop();

                        console.log(whatevs);

                        break;

                    default:
                        throw new Error(`You forgot to handle an opcode: ${instr.opcode}`);
                }
            }
            catch (e) // SmolThrown
            {
                let handled = false;
                let thrownObject = this.stack.pop() as SmolVariableType;

                while (this.stack.length > 0)
                {
                    var next = this.stack.pop();

                    if (next instanceof SmolTryRegionSaveState)
                    {
                        // We found the start of a try section, restore our state and jump to the exception handler location

                        let tryState = next as SmolTryRegionSaveState;

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

            /*if (this.stack.Count > _MaxStackSize) throw new Exception("Stack overflow");

            if (this.runMode == RunMode.Step && instr.StepCheckpoint == true)
            {
                this.runMode = RunMode.Paused;
                return;
            }*/
        }
    }
}