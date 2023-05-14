import { OpCode } from "./OpCode";

export class ByteCodeInstruction {
 
    opcode:OpCode;
    operand1:unknown;
    operand2:unknown;

    constructor(opcode:OpCode, operand1?:unknown, operand2?:unknown) {
        this.opcode = opcode;
        this.operand1 = operand1;
        this.operand2 = operand2;
    }

    toString():string {
        return this.opcode.toString();
    }
}