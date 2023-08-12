import { ByteCodeInstruction } from "./ByteCodeInstruction";
import { OpCode } from "./OpCode";
import { SmolFunction } from "./SmolVariableTypes/SmolFunction";
import { SmolVariableType } from "./SmolVariableTypes/SmolVariableType";
import { Token } from "./Token";

export class SmolProgram
{
    constants:SmolVariableType[] = [];
    code_sections:ByteCodeInstruction[][] = new Array<ByteCodeInstruction[]>();
    function_table:SmolFunction[] = [];
    tokens:Token[] = [];
    source:string|undefined;

    decompile(html = false) {
        let p = '';

        p += `.constants\n`;
        this.constants.forEach((c,n) => {
            if (html) {
                p += `${n}: ${(c.getValue() ?? c).toString().replace('<', '&lt;')}\n`;
            }
            else {
                p += `${n}: ${c.getValue()}\n`;
            }
        });

        p += `\n`;

        this.code_sections.forEach((s,n) => {

            p += `.code_section_${n}\n`;
            s.forEach((i, idx) => {

                if (html) {
                    p += `<div id="cs_${n}_${idx}">`;
                }

                if (i.isStatementStartpoint) {
                    p += '* ';
                }
                else {
                    p += '  ';
                }

                const op1 = i.operand1 != undefined ? ` ${i.operand1}` : '';
                const op2 = i.operand2 != undefined ? ` ${i.operand2}` : '';

                if (i.opcode == OpCode.CONST) {
                    
                    if (html) {
                        p += `${OpCode[i.opcode]} [${i.operand1}] ${this.constants[i.operand1 as number].toString().replace('<', '&lt;')}`;
                    }
                    else {
                        p += `${OpCode[i.opcode]} [${i.operand1}] ${this.constants[i.operand1 as number]}`;
                    }                   
                }
                else {
                    p += `${OpCode[i.opcode]}${op1}${op2}`;
                }

                p += ` [${i.token_map_start_index}, ${i.token_map_end_index}]`

                if (html) {
                    p += `</div>`;
                }
                else {
                    p += '\n';
                }
            });
            
            p += `\n`;
        });

        p += `.function_table:\n`;

        this.function_table.forEach((fn,n) => {
            p += `${n}: name: ${fn.global_function_name}, code_section: ${fn.code_section}, arity: ${fn.arity}, parameter names: ${fn.param_variable_names}\n`;
        });
        p += ``;

        return p;
    }
}