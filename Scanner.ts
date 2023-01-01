import { TokenType } from "./TokenType";
import { Token } from "./Token";

export class Scanner {

    _source: string;

    _currentPos: number = 0;
    _startOfToken: number = 0;
    _currentLine: number = 1;

    _tokens: Token[] = new Array();

    constructor(source:string) {
        this._source = source;
    }

    scanTokens() : void{

        while(!this.endOfFile()) {
            this._startOfToken = this._currentPos;
            this.scanToken();
        }

        this._tokens.push(new Token(TokenType.EOF, "", null, this._currentLine));
    }

    endOfFile() : boolean {

        return this._currentPos >= this._source.length;
    }

    scanToken() : void {

        var c = this.nextChar();

        switch(c) {
            case "(": this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '*': 
                if (this.matchNext('*'))
                {
                    this.addToken(TokenType.POW);
                }
                else
                {
                    this.addToken(TokenType.STAR);
                }
                break;
            case '!':
                if (this.matchNext('='))
                {
                    this.addToken(TokenType.BANG_EQUAL);
                }
                else
                {
                    this.addToken(TokenType.BANG);
                }
                break;
            case '=':
                if (this.matchNext('='))
                {
                    this.addToken(TokenType.EQUAL_EQUAL);
                }
                else
                {
                    this.addToken(TokenType.EQUAL);
                }
                break;
            case '<':
                if (this.matchNext('='))
                {
                    this.addToken(TokenType.LESS_EQUAL);
                }
                else
                {
                    this.addToken(TokenType.LESS);
                }
                break;
            case '>':
                if (this.matchNext('='))
                {
                    this.addToken(TokenType.GREATER_EQUAL);
                }
                else
                {
                    this.addToken(TokenType.GREATER);
                }
                break;
            case '/':
                if (this.matchNext('/'))
                {
                    while(this.peek() != '\n' && !this.endOfFile()) this.nextChar();
                }
                else
                {
                    this.addToken(TokenType.SLASH);
                }
                break;
            case '&':
                if (this.matchNext('&'))
                {
                    this.addToken(TokenType.AND);
                }
                break;
            case '|':
                if (this.matchNext('|'))
                {
                    this.addToken(TokenType.OR);
                }
                break;

            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace
                break;

            case '\n':
                this._currentLine++;
                break;

            case '"':
                this.processString();
                break;


            default:
                if (this.charIsDigit(c)) {
                    this.processNumber();
                }
                else if (this.charIsAlpha(c)) {
                    this.processIdentifier();
                }
                else {
                    console.log(`Unexpected character ${c}`);
                }
        }
    }

    nextChar() : string {
        return this._source.charAt(this._currentPos++);
    }

    peek() : string {
        if (this.endOfFile()) return '\0';
        return this._source.charAt(this._currentPos); 
    }

    peekAhead(offset:number) : string {
        if (this.endOfFile()) return '\0';
        return this._source.charAt(this._currentPos + offset); 
    }

    matchNext(charToMatch:string) : boolean {

        if (this.peek() == charToMatch) {

            this.nextChar(); // Consume the matched character
            return true;
        }
        else {
            return false;
        }

    }

    _charIsDigitRegex:RegExp = new RegExp("[0-9]");
    _charIsAlphaRegex:RegExp = new RegExp("[A-Za-z_]");

    charIsDigit(char:string) : boolean {
        return char.length == 1 && this._charIsDigitRegex.test(char);        
    }

    charIsAlpha(char:string) : boolean {
        return char.length == 1 && this._charIsAlphaRegex.test(char);        
    }

    charIsAlphaNumeric(char:string) : boolean {
        return this.charIsAlpha(char) || this.charIsDigit(char);
    }

    processNumber() : void {
        
        while(this.charIsDigit(this.peek())) this.nextChar(); 

        if (this.peek() == '.' && this.charIsDigit(this.peekAhead(1))) {

            // Consume the .
            this.nextChar();

            while(this.charIsDigit(this.peek())) this.nextChar(); 
        }

        var numberAsString = this._source.substring(this._startOfToken, this._currentPos);
        
        this.addTokenWithLiteral(TokenType.NUMBER, numberAsString);
    }

    processString() : void {

        while(this.peek() != '"' && !this.endOfFile()) this.nextChar();

        if (this.endOfFile()) {
            console.log("Unterminated string -- add error handling");
        }

        // Consume the final "
        this.nextChar();

        var extractedString = this._source.substring(this._startOfToken + 1, this._currentPos - 1);
        
        this.addTokenWithLiteral(TokenType.STRING, extractedString);
    }

    processIdentifier() : void {
        
        while(this.charIsAlphaNumeric(this.peek())) this.nextChar(); 

        var identifierAsString = this._source.substring(this._startOfToken, this._currentPos);
        
        this.addTokenWithLiteral(TokenType.IDENTIFIER, identifierAsString);
    }

    addToken(tokenType:TokenType) : void {
        this.addTokenWithLiteral(tokenType, null);
    }

    addTokenWithLiteral(tokenType:TokenType, literal:any) : void {
        var lexeme = this._source.substring(this._startOfToken, this._currentPos);

        this._tokens.push(new Token(tokenType, lexeme, literal, this._currentLine));
    }

}