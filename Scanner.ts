import { TokenType } from "./TokenType";
import { Token } from "./Token";

export class Scanner {

    _source: string;

    _currentPos: number = 0;
    _startOfToken: number = 0;
    _currentLine: number = 1;

    _tokens: Token[] = new Array();

    _keywords: { [keyword:string] : TokenType };

    private constructor(source:string) {
        this._source = source;

        this._keywords = {};
        this._keywords["and"] = TokenType.AND;
        this._keywords["break"] = TokenType.BREAK;
        this._keywords["class"] = TokenType.CLASS;
        this._keywords["else"] = TokenType.ELSE;
        this._keywords["false"] = TokenType.FALSE;
        this._keywords["for"] = TokenType.FOR;
        this._keywords["function"] = TokenType.FUNC;
        this._keywords["if"] = TokenType.IF;
        this._keywords["nil"] = TokenType.NIL;
        this._keywords["or"] = TokenType.OR;
        this._keywords["print"] = TokenType.PRINT;
        this._keywords["return"] = TokenType.RETURN;
        this._keywords["super"] = TokenType.SUPER;
        this._keywords["this"] = TokenType.THIS;
        this._keywords["true"] = TokenType.TRUE;
        this._keywords["var"] = TokenType.VAR;
        this._keywords["while"] = TokenType.WHILE;
    }

    static tokenize(source:string) : Token[] {
        var scanner = new Scanner(source);
        return scanner.scanTokens();
    }

    private scanTokens() : Token[] {

        while(!this.endOfFile()) {
            this._startOfToken = this._currentPos;
            this.scanToken();
        }

        this._tokens.push(new Token(TokenType.EOF, "", null, this._currentLine));

        return this._tokens;
    }

    private endOfFile() : boolean {

        return this._currentPos >= this._source.length;
    }

    private scanToken() : void {

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
                this.processString('"');
                break;
            case '\'':
                this.processString('\'');
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

    private nextChar() : string {
        return this._source.charAt(this._currentPos++);
    }

    private peek() : string {
        if (this.endOfFile()) return '\0';
        return this._source.charAt(this._currentPos); 
    }

    private peekAhead(offset:number) : string {
        if (this.endOfFile()) return '\0';
        return this._source.charAt(this._currentPos + offset); 
    }

    private matchNext(charToMatch:string) : boolean {

        if (this.peek() == charToMatch) {

            this.nextChar(); // Consume the matched character
            return true;
        }
        else {
            return false;
        }

    }

    private _charIsDigitRegex:RegExp = new RegExp("[0-9]");
    private _charIsAlphaRegex:RegExp = new RegExp("[A-Za-z_]");

    private charIsDigit(char:string) : boolean {
        return char.length == 1 && this._charIsDigitRegex.test(char);        
    }

    private charIsAlpha(char:string) : boolean {
        return char.length == 1 && this._charIsAlphaRegex.test(char);        
    }

    private charIsAlphaNumeric(char:string) : boolean {
        return this.charIsAlpha(char) || this.charIsDigit(char);
    }

    private processNumber() : void {
        
        while(this.charIsDigit(this.peek())) this.nextChar(); 

        if (this.peek() == '.' && this.charIsDigit(this.peekAhead(1))) {

            // Consume the .
            this.nextChar();

            while(this.charIsDigit(this.peek())) this.nextChar(); 
        }

        var numberAsString = this._source.substring(this._startOfToken, this._currentPos);
        
        this.addTokenWithLiteral(TokenType.NUMBER, numberAsString);
    }

    private processString(quoteChar:string) : void {

        while(this.peek() != quoteChar && !this.endOfFile()) this.nextChar();

        if (this.endOfFile()) {
            console.log("Unterminated string -- add error handling");
        }

        // Consume the final "
        this.nextChar();

        var extractedString = this._source.substring(this._startOfToken + 1, this._currentPos - 1);
        
        this.addTokenWithLiteral(TokenType.STRING, extractedString);
    }

    private processIdentifier() : void {
        
        while(this.charIsAlphaNumeric(this.peek())) this.nextChar(); 

        var identifierAsString = this._source.substring(this._startOfToken, this._currentPos);
        
        if (this._keywords[identifierAsString] != null) {
            this.addTokenWithLiteral(this._keywords[identifierAsString], identifierAsString);
        }
        else {
            this.addTokenWithLiteral(TokenType.IDENTIFIER, identifierAsString);
        }
    }

    private addToken(tokenType:TokenType) : void {
        this.addTokenWithLiteral(tokenType, null);
    }

    private addTokenWithLiteral(tokenType:TokenType, literal:any) : void {
        var lexeme = this._source.substring(this._startOfToken, this._currentPos);

        this._tokens.push(new Token(tokenType, lexeme, literal, this._currentLine));
    }

}