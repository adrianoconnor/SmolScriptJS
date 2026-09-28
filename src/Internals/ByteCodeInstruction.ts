import { OpCode } from './OpCode';

export class ByteCodeInstruction {
  // These are the classic bytecode-style values, though we're just storing them
  // as fields on an object
  opcode: OpCode;
  operand1: unknown;
  operand2: unknown;

  // This flag tells the debugger that this instruction starts a new statement,
  // which is how it steps through the program
  isStatementStartpoint = false;

  // These attributes are used for mapping back to the original source code
  tokenMapStartIndex?: number;
  tokenMapEndIndex?: number;

  constructor(opcode: OpCode, operand1?: unknown, operand2?: unknown) {
    this.opcode = opcode;
    this.operand1 = operand1;
    this.operand2 = operand2;
  }

  toString(): string {
    return this.opcode.toString();
  }
}
