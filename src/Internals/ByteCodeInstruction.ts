import { OpCode } from "./OpCode";

export class ByteCodeInstruction {
 
    // These are the classic bytecode-style values, though we're just storing them
    // as fields on an object
    opcode:OpCode;
    operand1:unknown;
    operand2:unknown;

    // This flag tells us that we're at the end of a single Statement, so this is where
    // the debugger would naturally step to if we're stepping through our program
    isStatementEndpoint:boolean;

    // These attributes are used for mapping back to the original source code
    token_map_start_index:number|undefined;
    token_map_end_index:number|undefined;
    
    constructor(opcode:OpCode, operand1?:unknown, operand2?:unknown) {
        this.opcode = opcode;
        this.operand1 = operand1;
        this.operand2 = operand2;
        this.isStatementEndpoint = false;
    }

    toString():string {
        return this.opcode.toString();
    }
}