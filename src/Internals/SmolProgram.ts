import { ByteCodeInstruction } from './ByteCodeInstruction';
import { OpCode } from './OpCode';
import { SmolFunction } from './SmolVariableTypes/SmolFunction';
import { SmolVariableType } from './SmolVariableTypes/SmolVariableType';
import { Token } from './Token';

export class SmolProgram {
  constants: SmolVariableType[] = [];
  codeSections: ByteCodeInstruction[][] = new Array<ByteCodeInstruction[]>();
  functions: SmolFunction[] = [];
  tokens: Token[] = [];
  source?: string;

  decompile(html = false) {
    let p = '';

    p += `.constants\n`;
    this.constants.forEach((c, n) => {
      if (html) {
        p += `${n}: ${c.toString().replace('<', '&lt;')}\n`;
      } else {
        p += `${n}: ${c.toString()}\n`;
      }
    });

    p += `\n`;

    this.codeSections.forEach((s, n) => {
      p += `.code_section_${n}\n`;
      s.forEach((i, idx) => {
        if (html) {
          p += `<div id="cs_${n}_${idx}">`;
        }

        if (i.isStatementStartpoint && i.opcode != OpCode.START) {
          p += '* ';
        } else {
          p += '  ';
        }

        const op1 = i.operand1 != undefined ? ` ${i.operand1.toString()}` : '';
        const op2 = i.operand2 != undefined ? ` ${i.operand2.toString()}` : '';

        if (i.opcode == OpCode.CONST && i.operand1 != undefined) {
          if (html) {
            p += `${OpCode[i.opcode]} [${i.operand1.toString()}] ${this.constants[i.operand1 as number].toString().replace('<', '&lt;')}`;
          } else {
            p += `${OpCode[i.opcode]} [${i.operand1.toString()}] ${this.constants[i.operand1 as number].toString()}`;
          }
        } else if (i.opcode == OpCode.START) {
          p += `PROGRAM START`;
        } else if (i.opcode == OpCode.EOF) {
          p += `PROGRAM END`;
        } else {
          p += `${OpCode[i.opcode]}${op1}${op2}`;
        }

        if (html) {
          p += `</div>`;
        } else {
          p += '\n';
        }
      });

      p += `\n`;
    });

    p += `.function_table:\n`;

    this.functions.forEach((fn, n) => {
      p += `${n}: name: ${fn.globalFunctionName}, code_section: ${fn.codeSection}, arity: ${fn.arity}, parameter names: ${fn.parameterNames.join(', ')}\n`;
    });
    p += ``;

    return p;
  }
}
