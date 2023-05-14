import { TokenType } from "./TokenType";

export class Token
{
    public type: TokenType;
    public lexeme: string;
    public literal: string|undefined;
    public line: number;

    constructor(type:TokenType, lexeme:string, literal:string|undefined, line:number)
    {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    toString(): string
    {
        return `Token: ${TokenType[this.type]}, ${this.lexeme}, ${this.literal}`;
    }
}