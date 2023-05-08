import { ByteCodeInstruction } from "./ByteCodeInstruction";
import { SmolFunction } from "./SmolVariableTypes/SmolFunction";
import { SmolVariableType } from "./SmolVariableTypes/SmolVariableType";

export class SmolProgram
{
    constants:SmolVariableType[] = new Array<SmolVariableType>();
    code_sections:ByteCodeInstruction[][] = new Array<ByteCodeInstruction[]>();
    function_table:SmolFunction[] = new Array<SmolFunction>();
}