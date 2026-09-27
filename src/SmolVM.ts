import { Compiler } from './Internals/Compiler';
import { Environment } from './Internals/Environment';
import { OpCode } from './Internals/OpCode';
import { SmolProgram } from './Internals/SmolProgram';
import { SmolStackType } from './Internals/SmolStackTypes/SmolStackType';
import { SmolNativeFunctionResult } from './Internals/SmolStackTypes/SmolNativeFunctionResult';
import { SmolFunction } from './Internals/SmolVariableTypes/SmolFunction';
import { SmolObject } from './Internals/SmolVariableTypes/SmolObject';
import { SmolVariableType } from './Internals/SmolVariableTypes/SmolVariableType';
import { SmolUndefined } from './Internals/SmolVariableTypes/SmolUndefined';
import { SmolCallSiteSaveState } from './Internals/SmolStackTypes/SmolCallSiteSaveState';
import { SmolNumber } from './Internals/SmolVariableTypes/SmolNumber';
import { SmolBool } from './Internals/SmolVariableTypes/SmolBool';
import { SmolString } from './Internals/SmolVariableTypes/SmolString';
import { SmolTryRegionSaveState } from './Internals/SmolStackTypes/SmolTryRegionSaveState';
import { SmolLoopMarker } from './Internals/SmolStackTypes/SmolLoopMarker';
import { ISmolNativeCallable } from './Internals/SmolVariableTypes/ISmolNativeCallable';
import { SmolArray } from './Internals/SmolVariableTypes/SmolArray';
import { RunMode } from './Internals/RunMode';
import { SmolRegExp } from './Internals/SmolVariableTypes/SmolRegExp';
import { SmolVariableCreator } from './Internals/SmolVariableTypes/SmolVariableCreator';
import { SmolError } from './Internals/SmolVariableTypes/SmolError';

class SmolThrownFromInstruction extends Error {
  // We use native exceptions to throw from both user code and internal operations.
  // This internal error type lets us our generic error handler know that it was user-thrown
}
export class SmolVM {
  program: SmolProgram;
  code_section = 0;
  pc = 0;
  runMode = RunMode.Paused;
  stack: SmolStackType[] = [];
  jmplocs: number[] = [];
  maxStackSize = -1;
  maxCycles = -1;
  totalCycles = 0;

  globalEnv = new Environment();
  environment: Environment = this.globalEnv;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  staticTypes: Record<string, any> = {};

  classMethodRegEx = new RegExp('@([A-Za-z]+)[.]([A-Za-z]+)');

  constructor(source: string) {
    const compiler = new Compiler();

    this.program = compiler.Compile(source);

    this.createStdLib();
    this.buildJumpTable();

    this.runMode = RunMode.Ready;
  }

  static Compile(source: string): SmolVM {
    return new SmolVM(source);
  }

  static Init(source: string): SmolVM {
    const vm = SmolVM.Compile(source);
    vm.run();
    return vm;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getGlobalVar(varName: string): any {
    return this.globalEnv.tryGet(varName)?.getValue() ?? undefined;
  }

  buildJumpTable() {
    // Loop through all labels in all code sections, capturing
    // the label number (always unique) and the location/index
    // in the instructions for that section so we can jump
    // if we need to.

    for (const codeSection of this.program.code_sections) {
      // Not sure if this will hold up, might be too simplistic

      for (const [j, instr] of codeSection.entries()) {
        if (instr.opcode == OpCode.LABEL) {
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

  decompile(): string {
    return this.program.decompile();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private externalMethods: Record<string, (...args: any[]) => unknown> = {};

  registerMethod<TArgs extends unknown[]>(
    methodName: string,
    closure: (...args: TArgs) => unknown
  ): void {
    this.externalMethods[methodName] = closure;
  }

  callExternalMethod(methodName: string, numberOfPassedArgs: number): SmolVariableType {
    const fn = this.externalMethods[methodName];
    if (!fn) {
      throw new Error(`External method '${methodName}' not registered`);
    }

    const methodArgs: unknown[] = [];

    for (let i = 0; i < numberOfPassedArgs; i++) {
      const value = this.stack.pop() as SmolVariableType;
      methodArgs.push(value.getValue());
    }

    const returnValue = fn(...methodArgs);

    if (typeof returnValue === 'undefined') {
      return new SmolUndefined();
    } else {
      return SmolVariableCreator.create(returnValue);
    }
  }

  call<TReturn = unknown>(functionName: string, ...args: unknown[]): TReturn {
    if (this.runMode != RunMode.Done) {
      throw new Error(
        'Init() should be used before calling a function, to ensure the vm state is prepared'
      );
    }

    this.runMode = RunMode.Paused;

    const state = new SmolCallSiteSaveState(this.code_section, this.pc, this.environment, true);

    const env = new Environment(this.globalEnv);
    this.environment = env;

    const fn = this.program.function_table.find((f) => f.global_function_name === functionName);

    if (!fn) {
      throw new Error(`Could not find a function named '${functionName}'`);
    }

    for (let i = 0; i < fn.arity; i++) {
      if (args.length > i) {
        env.define(fn.param_variable_names[i], SmolVariableCreator.create(args[i]));
      } else {
        env.define(fn.param_variable_names[i], new SmolUndefined());
      }
    }

    this.stack.push(state);
    this.pc = 0;
    this.code_section = fn.code_section;

    this.run();

    const returnValue = this.stack.pop();

    return (returnValue as SmolVariableType).getValue() as TReturn;
  }

  private debugFunc: ((str: string) => void) | undefined = undefined;

  set onDebugPrint(debugFunc: (str: string) => void) {
    this.debugFunc = debugFunc;
  }

  debug(str: string): void {
    if (this.debugFunc != undefined) this.debugFunc(str);
  }

  run(): void {
    if (this.runMode == RunMode.Ready || this.runMode == RunMode.Paused) {
      this._run(RunMode.Run);
    }
  }

  getCurrentRunMode(): string {
    return RunMode[this.runMode];
  }

  step(vmInstrStep = false): void {
    if (this.runMode == RunMode.Ready || this.runMode == RunMode.Paused) {
      this._run(vmInstrStep ? RunMode.InstructionStep : RunMode.Step);
    }
  }

  _run(newRunMode: RunMode) {
    this.runMode = newRunMode;
    let consumedCycles = 0;

    while (
      this.runMode == RunMode.Run
      || this.runMode == RunMode.Step
      || this.runMode == RunMode.InstructionStep
    ) {
      if (
        this.runMode == RunMode.Step
        && this.code_section == 0
        && this.program.code_sections[0].length < this.pc - 1
      ) {
        this.runMode = RunMode.Done;
        return;
      } else if (
        // Peek at the next instruction to see if it's a step point
        this.runMode == RunMode.Step
        && this.program.code_sections[this.code_section][this.pc].isStatementStartpoint
        && consumedCycles > 0
      ) {
        this.runMode = RunMode.Paused;
        return;
      } else if (this.runMode == RunMode.InstructionStep && consumedCycles > 0) {
        this.runMode = RunMode.Paused;
        return;
      }

      // Fetch the next instruciton and advance the program counter
      const instr = this.program.code_sections[this.code_section][this.pc++];

      this.debug(OpCode[instr.opcode]);

      try {
        switch (instr.opcode) {
          case OpCode.NOP:
          case OpCode.START:
            // Just skip over this instruction, it's a no-op
            break;

          case OpCode.CONST:
            this.stack.push(this.program.constants[instr.operand1 as number]);
            this.debug(
              `              [Loaded Const ${this.program.constants[instr.operand1 as number].toString()}]`
            );

            break;

          case OpCode.CALL: {
            const untypedCallData = this.stack.pop();

            if (untypedCallData instanceof SmolNativeFunctionResult) {
              // Everything was handled by the previous Fetch instruction, which made a native
              // call and left the result on the stack.
              break;
            }

            const callData = untypedCallData as SmolFunction;

            // First create the env for our function

            let env = new Environment(this.globalEnv);

            if (instr.operand2 as boolean) {
              // If op2 is true, that means we're calling a method
              // on an object/class, so we need to get the objref
              // (from the next value on the stack) and use that
              // objects environment instead.

              env = (this.stack.pop() as SmolObject).object_env;
            }

            // Next pop args off the stack. Op1 is number of args.

            const paramValues: SmolVariableType[] = new Array<SmolVariableType>();

            for (let i = 0; i < (instr.operand1 as number); i++) {
              paramValues.push(this.stack.pop() as SmolVariableType);
            }

            // Now prime the new environment with variables for
            // the parameters in the function declaration (actual number
            // passed might be different)

            for (let i = 0; i < callData.arity; i++) {
              if (paramValues.length > i) {
                env.define(callData.param_variable_names[i], paramValues[i]);
              } else {
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

          case OpCode.ADD: {
            const right = this.stack.pop() as SmolVariableType;
            const left = this.stack.pop() as SmolVariableType;

            if (left instanceof SmolNumber && right instanceof SmolNumber) {
              this.stack.push(new SmolNumber(left.getValue() + right.getValue()));
            } else {
              this.stack.push(new SmolString(String(left.getValue()) + String(right.getValue())));
            }

            break;
          }

          case OpCode.SUB: {
            const right = this.stack.pop() as SmolVariableType;
            const left = this.stack.pop() as SmolVariableType;

            this.stack.push(new SmolNumber(left.getValue() - right.getValue()));

            break;
          }

          case OpCode.MUL: {
            const right = this.stack.pop() as SmolVariableType;
            const left = this.stack.pop() as SmolVariableType;

            this.stack.push(new SmolNumber(left.getValue() * right.getValue()));

            break;
          }

          case OpCode.DIV: {
            const right = this.stack.pop() as SmolVariableType;
            const left = this.stack.pop() as SmolVariableType;

            this.stack.push(new SmolNumber(left.getValue() / right.getValue()));

            break;
          }

          case OpCode.REM: {
            const right = this.stack.pop() as SmolVariableType;
            const left = this.stack.pop() as SmolVariableType;

            this.stack.push(new SmolNumber(left.getValue() % right.getValue()));

            break;
          }

          case OpCode.POW: {
            const right = this.stack.pop() as SmolVariableType;
            const left = this.stack.pop() as SmolVariableType;

            this.stack.push(new SmolNumber(left.getValue() ** right.getValue()));

            break;
          }

          case OpCode.EQL: {
            const right = this.stack.pop() as SmolVariableType;
            const left = this.stack.pop() as SmolVariableType;

            this.stack.push(new SmolBool(left.equals(right)));

            break;
          }

          case OpCode.NEQ: {
            const right = this.stack.pop() as SmolVariableType;
            const left = this.stack.pop() as SmolVariableType;

            this.stack.push(new SmolBool(!left.equals(right)));

            break;
          }

          case OpCode.GT: {
            const right = this.stack.pop() as SmolVariableType;
            const left = this.stack.pop() as SmolVariableType;

            this.stack.push(new SmolBool(left.getValue() > right.getValue()));

            break;
          }

          case OpCode.LT: {
            const right = this.stack.pop() as SmolVariableType;
            const left = this.stack.pop() as SmolVariableType;

            this.stack.push(new SmolBool(left.getValue() < right.getValue()));

            break;
          }

          case OpCode.GTE: {
            const right = this.stack.pop() as SmolVariableType;
            const left = this.stack.pop() as SmolVariableType;

            this.stack.push(new SmolBool(left.getValue() >= right.getValue()));

            break;
          }

          case OpCode.LTE: {
            const right = this.stack.pop() as SmolVariableType;
            const left = this.stack.pop() as SmolVariableType;

            this.stack.push(new SmolBool(left.getValue() <= right.getValue()));

            break;
          }

          case OpCode.BITWISE_OR: {
            const right = this.stack.pop() as SmolVariableType;
            const left = this.stack.pop() as SmolVariableType;

            this.stack.push(new SmolNumber(left.getValue() | right.getValue()));

            break;
          }

          case OpCode.BITWISE_AND: {
            const right = this.stack.pop() as SmolVariableType;
            const left = this.stack.pop() as SmolVariableType;

            this.stack.push(new SmolNumber(left.getValue() & right.getValue()));

            break;
          }

          case OpCode.EOF: {
            //console.log(`Done, stack size = ${this.stack.length}, consumed cycles = ${consumedCycles}`);
            this.runMode = RunMode.Done;
            this.pc--;
            return;
          }

          case OpCode.RETURN: {
            // Return to the previous code section, putting
            // a return value on the stack and restoring the PC

            // Top value on the stack is the return value

            const return_value = this.stack.pop();

            // Next value should be the original pre-call state that we saved

            const savedCallState = this.stack.pop();

            if (!(savedCallState instanceof SmolCallSiteSaveState)) {
              throw new Error('Tried to return but found something unexecpted on the stack');
            }

            this.environment = savedCallState.previous_env;
            this.pc = savedCallState.pc;
            this.code_section = savedCallState.code_section;

            // Return value needs to go back on the stack
            this.stack.push(return_value == undefined ? new SmolUndefined() : return_value);

            if (savedCallState.call_is_extern) {
              // Not sure what to do about return value here

              this.runMode = RunMode.Paused;
              return; // Don't like this, error prone
            }

            if (this.runMode == RunMode.Step) {
              this.runMode = RunMode.Paused;
              return;
            }

            break;
          }
          case OpCode.DECLARE:
            this.environment.define(instr.operand1 as string, new SmolUndefined());
            break;

          case OpCode.STORE: {
            let name = instr.operand1 as string;

            //console.log(name);
            //console.log(this.stack);

            if (name == '@IndexerSet') {
              // Special case for square brackets!

              // Not sure about this cast, might need to add an extra check for type

              name = String((this.stack.pop() as SmolVariableType).getValue());
            }

            const value = this.stack.pop() as SmolVariableType; // Hopefully always true...

            let env_in_context = this.environment;
            let isPropertySetter = false;

            if (instr.operand2 != undefined && (instr.operand2 as boolean)) {
              //console.log(this.stack);

              const objRef = this.stack.pop();

              isPropertySetter = true;

              if (objRef instanceof SmolObject) {
                env_in_context = objRef.object_env;
              } else if (objRef instanceof ISmolNativeCallable) {
                objRef.setProp(name, value);
                break;
              } else {
                throw new Error(
                  `${objRef?.constructor.name ?? '<unknown>'} is not a valid target for this call`
                );
              }
            }

            env_in_context.assign(name, value, isPropertySetter);

            this.debug(`              [Saved ${value.toString()}]`);

            break;
          }

          case OpCode.FETCH: {
            let name = instr.operand1 as string;
            let env_in_context = this.environment;

            // WARNING -- Difference heere between .net and ts versions and I can't remember why .net was changed :(
            // TODO: Check why the difference and fix...
            if (name == '@IndexerGet' || name == '@IndexerSet') {
              // Special case for square brackets!

              name = String((this.stack.pop() as SmolVariableType).getValue());
            }

            if (instr.operand2 != null && (instr.operand2 as boolean)) {
              const objRef = this.stack.pop();
              const peek_instr = this.program.code_sections[this.code_section][this.pc];

              if (objRef instanceof SmolObject) {
                env_in_context = objRef.object_env;

                if (peek_instr.opcode == OpCode.CALL && (peek_instr.operand2 as boolean)) {
                  this.stack.push(objRef);
                }
              } else {
                if (objRef instanceof ISmolNativeCallable) {
                  const isFuncCall = peek_instr.opcode == OpCode.CALL && peek_instr.operand2;

                  if (isFuncCall) {
                    // We need to get some arguments

                    const paramValues = new Array<SmolVariableType>();

                    for (let i = 0; i < (peek_instr.operand1 as number); i++) {
                      paramValues.push(this.stack.pop() as SmolVariableType);
                    }

                    this.stack.push(objRef.nativeCall(name, paramValues));
                    this.stack.push(new SmolNativeFunctionResult()); // Call will use this to see that the call is already done.
                  } else {
                    // For now won't work with Setter

                    this.stack.push(objRef.getProp(name));
                  }

                  break;
                } else if (objRef instanceof SmolNativeFunctionResult) {
                  if (this.classMethodRegEx.test(name)) {
                    const rexResult = this.classMethodRegEx.exec(name);

                    if (rexResult == null) {
                      throw new Error('class method name regex failed');
                    }

                    const className = rexResult[1];
                    const functionName = rexResult[2];
                    const functionArgs: SmolVariableType[] = [];

                    if (name != '@Object.constructor') {
                      for (let i = 0; i < (peek_instr.operand1 as number); i++) {
                        functionArgs.push(this.stack.pop() as SmolVariableType);
                      }

                      if ((peek_instr.operand1 as number) > 0) {
                        // I can't even remember why I added this and then commented it out, surely it's nothing important
                        // parameters.push(functionArgs);
                      }
                    }

                    // Now we've got rid of the params we can get rid
                    // of the dummy object that create_object left on the stack
                    this.stack.pop();

                    // Call the static method on the actual class that wraps the type
                    // This is probably a bit of a hack, but it works OK for now.
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                    const r = this.staticTypes[className].staticCall(
                      functionName,
                      functionArgs
                    ) as SmolVariableType;

                    if (name == '@Object.constructor') {
                      // Hack alert!!!
                      (r as SmolObject).object_env = new Environment(this.globalEnv);
                    }

                    this.stack.push(r);

                    // And now fill in some fake object refs again:
                    this.stack.push(new SmolNativeFunctionResult()); // Call will use this to see that the call is already done.
                    this.stack.push(new SmolNativeFunctionResult()); // Pop and Discard following Call will discard this

                    break;
                  }
                } else {
                  throw new Error(
                    `${objRef?.constructor.name ?? '<unknown>'} is not a valid target for this call`
                  );
                }
              }
            }

            const fetchedValue = env_in_context.tryGet(name);

            if (fetchedValue != null) {
              this.stack.push(fetchedValue);
              this.debug(`              [Loaded ${fetchedValue.getValue()}]`);
            } else {
              const fn = this.program.function_table.find((f) => f.global_function_name == name);

              if (fn != undefined) {
                this.stack.push(fn);
              } else if (this.externalMethods[name] != undefined) {
                const peek_instr = this.program.code_sections[this.code_section][this.pc];

                this.stack.push(this.callExternalMethod(name, peek_instr.operand1 as number));

                this.stack.push(new SmolNativeFunctionResult());
              } else {
                this.stack.push(new SmolUndefined());
              }
            }

            break;
          }

          // In .net, we use .IsTruthy() and .IsFalsey() to simulate JS truthiness,
          // but since here we're running in JS I think we should be ok to just lean on
          // the native built-in truthiness/falsiness of the value itself. Applies to
          // anywhere we do boolean logic in the run-time, but these are the main
          // operations...
          case OpCode.JMPFALSE: {
            const value = this.stack.pop() as SmolVariableType;

            if (value.getValue() == false) {
              this.pc = this.jmplocs[instr.operand1 as number];
            }

            break;
          }

          case OpCode.JMPTRUE: {
            const value = this.stack.pop() as SmolVariableType;

            if (value.getValue() == true) {
              this.pc = this.jmplocs[instr.operand1 as number];
            }

            break;
          }

          case OpCode.JMP:
            this.pc = this.jmplocs[instr.operand1 as number];
            break;

          case OpCode.LABEL:
            // Just skip over this instruction, it's a no-op and only here to support branching
            break;

          case OpCode.ENTER_SCOPE: {
            this.environment = new Environment(this.environment);
            break;
          }

          case OpCode.LEAVE_SCOPE: {
            if (this.environment.enclosing == null) {
              throw new Error('Tried to leave scope but there is no enclosing scope');
            }

            this.environment = this.environment.enclosing;
            break;
          }

          case OpCode.DEBUGGER:
              this.runMode = RunMode.Paused;
              return;

          case OpCode.POP_AND_DISCARD:
            // operand1 is optional bool, default true means fail if nothing to pop
            if (this.stack.length > 0 || instr.operand1 == null || (instr.operand1 as boolean)) {
              this.stack.pop();
            }
            break;

          case OpCode.TRY: {
            let storedException: SmolVariableType | undefined = undefined;

            if (instr.operand2 != undefined && (instr.operand2 as boolean)) {
              // This is a special flag for the try instruction that tells us to
              // take the exception that's already on the stack and leave it at the
              // top after creating the try checkpoint.

              storedException = this.stack.pop() as SmolVariableType;
            }

            this.stack.push(
              new SmolTryRegionSaveState(
                this.code_section,
                this.pc,
                this.environment,
                this.jmplocs[instr.operand1 as number]
              )
            );

            if (storedException != undefined) {
              this.stack.push(storedException);
            }

            break;
          }

          case OpCode.THROW:
            throw new SmolThrownFromInstruction();

          case OpCode.LOOP_START:
            this.stack.push(new SmolLoopMarker(this.environment));
            break;

          case OpCode.LOOP_END:
            this.stack.pop();
            break;

          case OpCode.LOOP_EXIT:
            while (this.stack.length > 0) {
              const next = this.stack.pop();

              if (next instanceof SmolLoopMarker) {
                this.environment = next.current_env;

                this.stack.push(next); // Needs to still be on the stack

                if (instr.operand1 != undefined) {
                  this.pc = this.jmplocs[instr.operand1 as number];
                }

                break;
              }
            }

            break;

          case OpCode.CREATE_OBJECT: {
            // Create a new environment and store it as an instance/ref variable
            // For now we'll just have it 'inherit' the global env, but scope is
            // a thing we need to think about, but I'll work out how JS does it
            // first and try and do the same (I think class hierarchies all share
            // a single env?!

            const class_name = instr.operand1 as string;

            if (this.staticTypes[class_name] != undefined) {
              this.stack.push(new SmolNativeFunctionResult());
              break;
            }

            const obj_environment = new Environment(this.globalEnv);

            this.program.function_table
              .filter((el) => el.global_function_name.startsWith(`@${class_name}.`))
              .forEach((classFunc) => {
                const funcName = classFunc.global_function_name.substring(class_name.length + 2);

                obj_environment.define(
                  funcName,
                  new SmolFunction(
                    classFunc.global_function_name,
                    classFunc.code_section,
                    classFunc.arity,
                    classFunc.param_variable_names
                  )
                );
              });

            this.stack.push(new SmolObject(obj_environment, class_name));

            obj_environment.define('this', this.stack.peek() as SmolVariableType);

            break;
          }

          case OpCode.DUPLICATE_VALUE: {
            const skip = instr.operand1 != undefined ? (instr.operand1 as number) : 0;

            const itemToDuplicate = this.stack[this.stack.length - 1 - skip];

            this.stack.push(itemToDuplicate);

            break;
          }

          case OpCode.PRINT: {
            const valueToPrint = this.stack.pop() as SmolVariableType;

            console.log(valueToPrint.getValue());

            break;
          }

          default:
            throw new Error(`You forgot to handle an opcode: ${instr.opcode}`);
        }
      } catch (e) {
        let handled = false;
        let throwObject: SmolVariableType = new SmolError((e as Error).message);

        if (e instanceof SmolThrownFromInstruction) {
          const thrownObject = this.stack.pop() as SmolVariableType;
          throwObject = thrownObject;
        }

        while (this.stack.length > 0) {
          const nextStackItem = this.stack.pop();

          if (nextStackItem instanceof SmolTryRegionSaveState) {
            // We found the start of a try section, restore our state and jump to the exception handler location

            const tryState = nextStackItem;

            this.code_section = tryState.code_section;
            this.pc = tryState.jump_exception;
            this.environment = tryState.this_env;

            this.stack.push(throwObject);

            handled = true;
            break;
          }
        }

        if (!handled) {
          throw e;
        }
      }

      if (this.maxStackSize > -1 && this.stack.length > this.maxStackSize)
        throw new Error('Stack overflow');

      consumedCycles += 1;
      this.totalCycles += 1;

      if (this.maxCycles > -1 && consumedCycles > this.maxCycles)
        throw new Error('Too many cycles');
    }
  }
}
