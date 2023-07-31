import { TokenType } from "./TokenType";

export class Token
{
    public type: TokenType;
    public lexeme: string;
    public literal: string|undefined;

    public line: number;
    public col: number;

    public start_pos: number;
    public end_pos: number;

    public followed_by_line_break: boolean;

    constructor(type:TokenType, lexeme:string, literal:string|undefined,
                line:number, col:number, start_pos:number, end_pos:number)
    {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
        this.col = col;
        this.start_pos = start_pos;
        this.end_pos = end_pos;
        this.followed_by_line_break = false;
    }

    toString(): string
    {
        return `Token: ${TokenType[this.type]}, ${this.lexeme}, ${this.literal}`;
    }
}