import { ByteCodeInstruction } from './ByteCodeInstruction';
import { OpCode } from './OpCode';

export {};

declare global {
  interface Array<T> {
    appendChunk(
      this: ByteCodeInstruction[],
      chunkOrInstruction: ByteCodeInstruction[] | ByteCodeInstruction
    ): ByteCodeInstruction[];
    appendInstruction(
      this: ByteCodeInstruction[],
      opcode: OpCode,
      operand1?: unknown,
      operand2?: unknown
    ): ByteCodeInstruction[];
    peek(): T;
    mapTokens(
      firstTokenIndex: number | undefined,
      lastTokenIndex: number | undefined
    ): ByteCodeInstruction[];
  }
}

if (!Array.prototype.appendChunk) {
  Array.prototype.appendChunk = function (
    this: ByteCodeInstruction[],
    chunkOrInstruction: ByteCodeInstruction[] | ByteCodeInstruction
  ): ByteCodeInstruction[] {
    if (Array.isArray(chunkOrInstruction)) {
      for (const element of chunkOrInstruction) {
        this.push(element);
      }
    } else if (chunkOrInstruction instanceof ByteCodeInstruction) {
      this.push(chunkOrInstruction);
    } else {
      throw new Error(`Can't append unknown chunk of type ${typeof chunkOrInstruction}`);
    }

    return this;
  };
}

if (!Array.prototype.appendInstruction) {
  Array.prototype.appendInstruction = function (
    this: ByteCodeInstruction[],
    opcode: OpCode,
    operand1?: unknown,
    operand2?: unknown
  ): ByteCodeInstruction[] {
    const instr = new ByteCodeInstruction(opcode, operand1, operand2);
    instr.tokenMapEndIndex = undefined;
    this.push(instr);
    return this;
  };
}

// This allows us to quickly access the last item of an array when we're using it as a stack
if (!Array.prototype.peek) {
  Array.prototype.peek = function <T>(this: T[]): T {
    return this[this.length - 1];
  };
}

if (!Array.prototype.mapTokens) {
  Array.prototype.mapTokens = function <ByteCodeInstruction>(
    this: ByteCodeInstruction[],
    firstTokenIndex: number | undefined,
    lastTokenIndex: number | undefined
  ): ByteCodeInstruction[] {
    for (const element of this) {
      const mappedElement = element as ByteCodeInstruction & {
        tokenMapStartIndex?: number;
        tokenMapEndIndex?: number;
      };

      if (mappedElement.tokenMapStartIndex == undefined) {
        mappedElement.tokenMapStartIndex = firstTokenIndex;
      }

      if (mappedElement.tokenMapEndIndex == undefined) {
        mappedElement.tokenMapEndIndex = lastTokenIndex;
      }
    }

    return this;
  };
}
