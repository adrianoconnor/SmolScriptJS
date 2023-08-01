import { ByteCodeInstruction } from "./ByteCodeInstruction";
import { OpCode } from "./OpCode";

export { }

declare global {
    // We do a lot of work with arrays/collections, so these convenience methods/extensions
    // help us keeep our code a little bit tidier
    interface Array<T> {
        appendChunk(elem: T): T;
        appendInstruction(opcode: OpCode, operand1?: unknown, operand2?: unknown): T;
        peek(): T;
        mapTokens(first_token_index: number | undefined, last_token_index: number | undefined): T;
    }
}

if (!Array.prototype.appendChunk) {
    Array.prototype.appendChunk = function <ByteCodeInstruction>(this: ByteCodeInstruction[], elem: ByteCodeInstruction[] | ByteCodeInstruction): ByteCodeInstruction[] {
        if (Array.isArray(elem)) {
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
    Array.prototype.appendInstruction = function <ByteCodeInstruction>(this: ByteCodeInstruction[], opcode: OpCode, operand1?: unknown, operand2?: unknown): ByteCodeInstruction[] {
        const instr = new ByteCodeInstruction(opcode, operand1, operand2);
        instr.token_map_end_index = undefined;
        this.push(instr as ByteCodeInstruction);
        return this;
    }
}

// This allows us to quickly access the last item of an array when we're using it as a stack
if (!Array.prototype.peek) {
    Array.prototype.peek = function <T>(this: T[]): T {
        return this[this.length - 1];
    }
}

if (!Array.prototype.mapTokens) {
    Array.prototype.mapTokens = function <ByteCodeInstruction>(this: ByteCodeInstruction[],
        first_token_index: number | undefined, last_token_index: number | undefined): ByteCodeInstruction[] {
        
        for(var element of (this as any[])) {
            if (element.token_map_start_index == undefined) {
                element.token_map_start_index = first_token_index;
            }

            if (element.token_map_end_index == undefined) {
                element.token_map_end_index = last_token_index;
            }
        }

        return this;
    }
}
