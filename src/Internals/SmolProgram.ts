import { ByteCodeInstruction } from "./ByteCodeInstruction";
import { OpCode } from "./OpCode";
import { SmolFunction } from "./SmolVariableTypes/SmolFunction";
import { SmolVariableType } from "./SmolVariableTypes/SmolVariableType";

export class SmolProgram
{
    constants:SmolVariableType[] = new Array<SmolVariableType>();
    code_sections:ByteCodeInstruction[][] = new Array<ByteCodeInstruction[]>();
    function_table:SmolFunction[] = new Array<SmolFunction>();

    decompile() {
        var p = '';

        p += `.constants\n`;
        this.constants.forEach((c,n) => {
            p += `${n}: ${c.getValue()}\n`;
        });

        p += `\n`;

        this.code_sections.forEach((s,n) => {

            p += `.code_section_${n}\n`;
            s.forEach((i) => {
                const op1 = i._operand1 != undefined ? ` ${i._operand1}` : '';
                const op2 = i._operand2 != undefined ? ` ${i._operand2}` : '';
                p += `${OpCode[i._opcode]}${op1}${op2}\n`;
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