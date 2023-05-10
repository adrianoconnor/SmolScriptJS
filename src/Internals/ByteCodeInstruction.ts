import { OpCode } from "./OpCode";

export class ByteCodeInstruction {
 
    opcode:OpCode;
    operand1:any;
    operand2:any;

    constructor(opcode:OpCode, operand1?:any, operand2?:any) {
        this.opcode = opcode;
        this.operand1 = operand1;
        this.operand2 = operand2;
    }

    toString():String {
        return this.opcode.toString();
    }
}