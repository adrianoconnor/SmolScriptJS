import { OpCode } from "./OpCode";

export class ByteCodeInstruction {
 
    _opcode:OpCode;
    _operand1:any;
    _operand2:any;

    constructor(opcode:OpCode, operand1?:any, operand2?:any) {
        this._opcode = opcode;
        this._operand1 = operand1;
        this._operand2 = operand2;
    }

    toString():String {
        return this._opcode.toString();
    }
}