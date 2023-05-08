import { TokenType } from "./TokenType";
import { Token } from "./Token";
import { ScannerError } from "./ScannerError";
import { Expression } from "./Ast/Expressions/Expression";

export class Scanner {

    _source: string;

    _currentPos: number = 0;
    _startOfToken: number = 0;
    _currentLine: number = 1;

    _tokens: Token[] = new Array();
    _errors: ScannerError[] = new Array();

    _keywords: { [keyword:string] : TokenType };

    private constructor(source:string) {
        this._source = source;

        this._keywords = {};
        this._keywords["break"] = TokenType.BREAK;
        this._keywords["class"] = TokenType.CLASS;
        this._keywords["case"] = TokenType.CASE;
        this._keywords["continue"] = TokenType.CONTINUE;
        this._keywords["debugger"] = TokenType.DEBUGGER;
        this._keywords["do"] = TokenType.DO;
        this._keywords["else"] = TokenType.ELSE;
        this._keywords["false"] = TokenType.FALSE;
        this._keywords["for"] = TokenType.FOR;
        this._keywords["function"] = TokenType.FUNC;
        this._keywords["if"] = TokenType.IF;
        this._keywords["null"] = TokenType.NULL;
        this._keywords["new"] = TokenType.NEW;
        this._keywords["print"] = TokenType.PRINT;
        this._keywords["return"] = TokenType.RETURN;
        this._keywords["super"] = TokenType.SUPER;
        this._keywords["switch"] = TokenType.SWITCH;
        this._keywords["true"] = TokenType.TRUE;
        this._keywords["var"] = TokenType.VAR;
        this._keywords["while"] = TokenType.WHILE;
        this._keywords["undefined"] = TokenType.UNDEFINED;
        this._keywords["try"] = TokenType.TRY;
        this._keywords["catch"] = TokenType.CATCH;
        this._keywords["finally"] = TokenType.FINALLY;
        this._keywords["throw"] = TokenType.THROW;
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
            case "(": this.addToken(TokenType.LEFT_BRACKET); break;
            case ')': this.addToken(TokenType.RIGHT_BRACKET); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case '[': this.addToken(TokenType.LEFT_SQUARE_BRACKET); break;
            case ']': this.addToken(TokenType.RIGHT_SQUARE_BRACKET); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '?': this.addToken(TokenType.QUESTION_MARK); break;
            case ':': this.addToken(TokenType.COLON); break;
            case '-':
                if (this.matchNext('-'))
                {
                    if (this._tokens.length > 0 && this._tokens[this._tokens.length - 1].type == TokenType.IDENTIFIER)
                    {
                        this.addToken(TokenType.POSTFIX_DECREMENT);
                    }
                    else
                    {
                        this.addToken(TokenType.PREFIX_DECREMENT);
                    }
                }
                else if (this.matchNext('='))
                {
                    this.addToken(TokenType.MINUS_EQUALS);
                }
                else
                {
                    this.addToken(TokenType.MINUS);
                }
                break;
            case '+':
                if (this.matchNext('-'))
                {
                    if (this._tokens.length > 0 && this._tokens[this._tokens.length - 1].type == TokenType.IDENTIFIER)
                    {
                        this.addToken(TokenType.POSTFIX_INCREMENT);
                    }
                    else
                    {
                        this.addToken(TokenType.PREFIX_INCREMENT);
                    }
                }
                else if (this.matchNext('='))
                {
                    this.addToken(TokenType.PLUS_EQUALS);
                }
                else
                {
                    this.addToken(TokenType.PLUS);
                }
                break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '*': 
                if (this.matchNext('*'))
                {
                    if (this.matchNext('='))
                    {
                        this.addToken(TokenType.POW_EQUALS); 
                    }
                    else
                    {
                        this.addToken(TokenType.POW);
                    }
                }
                else if (this.matchNext('='))
                {
                    this.addToken(TokenType.MULTIPLY_EQUALS);
                }
                else
                {
                    this.addToken(TokenType.MULTIPLY);
                }
                break;
            case '!':
                if (this.matchNext('='))
                {
                    this.addToken(TokenType.NOT_EQUAL);
                }
                else
                {
                    this.addToken(TokenType.NOT);
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
                else if (this.matchNext('*'))
                {
                    while (this.peek() != '*' || this.peek(1) != '/')
                    {
                        if (this.endOfFile())
                        {
                            //_errors.Add(new ScannerError(_line, $"Expected end of comment block"));
                            throw new Error(`Expected end of a comment block but reached the end of the file`);
                        }
                        else
                        {
                            c = this.nextChar();
                        }
                    }

                    this.matchNext('*');
                    this.matchNext('/');
                }
                else if (this.matchNext('='))
                {
                    this.addToken(TokenType.DIVIDE_EQUALS);
                }
                else
                {
                    this.addToken(TokenType.DIVIDE);
                }
                break;
            case '%':
                this.addToken(TokenType.REMAINDER);
                break;
            case '&':
                if (this.matchNext('&'))
                {
                    this.addToken(TokenType.LOGICAL_AND);
                }
                else
                {
                    this.addToken(TokenType.BITWISE_AND);
                }
                break;
            case '|':
                if (this.matchNext('|'))
                {
                    this.addToken(TokenType.LOGICAL_OR);
                }
                else
                {
                    this.addToken(TokenType.BITWISE_OR)
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
            case '`':
                this.processBacktickString();
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
                    throw new Error(`Unexpected character ${c}`);
                }
        }
    }

    private nextChar() : string {
        return this._source.charAt(this._currentPos++);
    }

    private peek(lookAhead:number = 0) : string {
        if (this.endOfFile()) return '\0';
        return this._source.charAt(this._currentPos + lookAhead); 
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

        var extractedString = '';

        while(this.peek() != quoteChar && !this.endOfFile())
        { 
            if (this.matchNext('\n')) // Peek() == '\n')
            {
                this._currentLine++;
                //_errors.Add(new ScannerError(_line, "Unexpected Line break in string"));
                throw new Error("Unexpected Line break in string");
            }

            if (this.peek() == '\\')
            {
                var next = this.peek(1);

                if (next == '\'' || next == '"' || next == '\\')
                {
                    this.nextChar();
                    extractedString += this.nextChar();
                }
                else if (next == 't')
                {
                    this.nextChar();
                    this.nextChar();
                    extractedString += '\t';
                }
                else if (next == 'r')
                {
                    this.nextChar();
                    this.nextChar();
                    extractedString += '\r';
                }
                else if (next == 'n')
                {
                    this.nextChar();
                    this.nextChar();
                    extractedString += '\n';
                }
                else
                {
                    extractedString += this.nextChar();
                }
            }
            else
            {
                extractedString += this.nextChar();
            } 
        }

        if (this.endOfFile()) {
            //console.log("Unterminated string");
            throw new Error("Unterminated string");
        }

        // Consume the final "
        this.nextChar();

        //var extractedString = this._source.substring(this._startOfToken + 1, this._currentPos - 1);
        
        this.addTokenWithLiteral(TokenType.STRING, extractedString);
    }

    private processBacktickString() : void {

        var quoteChar = '`';
        var extractedString = '';
        var hasProducedAtLeastOneToken = false;

        while(this.peek() != quoteChar && !this.endOfFile())
        { 
            if (this.peek() == '\n')
            {
                this._currentLine++;
            }

            if (this.peek() == '\\')
            {
                var next = this.peek(1);

                if (next == '\'' || next == '"' || next == '\\')
                {
                    this.nextChar();
                    extractedString += this.nextChar();
                }
                else if (next == 't')
                {
                    this.nextChar();
                    this.nextChar();
                    extractedString += '\t';
                }
                else if (next == 'r')
                {
                    this.nextChar();
                    this.nextChar();
                    extractedString += '\r';
                }
                else if (next == 'n')
                {
                    this.nextChar();
                    this.nextChar();
                    extractedString += '\n';
                }
                else
                {
                    extractedString += this.nextChar();
                }
            }
            else
            {
                extractedString += this.nextChar();
            } 
        }

        if (this.endOfFile()) {
            //console.log("Unterminated string");
            throw new Error("Unterminated string");
        }

        // Consume the final "
        this.nextChar();

        //var extractedString = this._source.substring(this._startOfToken + 1, this._currentPos - 1);
        
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