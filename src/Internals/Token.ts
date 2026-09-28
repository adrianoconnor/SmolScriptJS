import { TokenType } from './TokenType';

export class Token {
  public type: TokenType;
  public lexeme: string;
  public literal?: string;

  public line: number;
  public col: number;

  public startPos: number;
  public endPos: number;

  public isFollowedByLineBreak: boolean;

  constructor(
    type: TokenType,
    lexeme: string,
    literal: string | undefined,
    line: number,
    col: number,
    startPos: number,
    endPos: number
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
    this.col = col;
    this.startPos = startPos;
    this.endPos = endPos;
    this.isFollowedByLineBreak = false;
  }

  toString(): string {
    return `Token: ${TokenType[this.type]}, ${this.lexeme}, ${this.literal}`;
  }
}
