import { TokenType } from "./TokenType";
import { Token } from "./Token";
import { ScannerError } from "./ScannerError";
import { CompilerError } from "../SmolErrorTypes";

export class Scanner {

    _source: string;

    _currentPos = 0;
    _previous = 0;
    _startOfToken = 0;
    _currentLine = 1;
    _currentLineStartIndex = 0;

    _tokens: Token[] = [];
    _errors: ScannerError[] = [];

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
        return new Scanner(source).scanTokens();
    }

    private scanTokens() : Token[] {

        while(!this.endOfFile()) {
            this._startOfToken = this._currentPos;
            this.scanToken();
        }

        this._tokens.push(new Token(TokenType.EOF, "", undefined, this._currentLine, this._currentPos, this._currentPos, this._currentPos));

        return this._tokens;
    }

    private endOfFile() : boolean {

        return this._currentPos >= this._source.length;
    }

    private scanToken() : void {

        let c = this.nextChar();

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
                    if (this._tokens.length > 0 && this._tokens[this._tokens.length - 1].type == TokenType.IDENTIFIER
                        && this._tokens[this._tokens.length - 1].followed_by_line_break == false)
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
                if (this.matchNext('+'))
                {
                    if (this._tokens.length > 0 && this._tokens[this._tokens.length - 1].type == TokenType.IDENTIFIER
                        && this._tokens[this._tokens.length - 1].followed_by_line_break == false)
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

                            if (c == '\n') {
                                this._currentLine++;
                                this._currentLineStartIndex = this._currentPos;
                            }
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
                if (this.matchNext('='))
                {
                    this.addToken(TokenType.REMAINDER_EQUALS);
                }
                else
                {
                    this.addToken(TokenType.REMAINDER);
                }
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
                this._previous = this._currentPos;
            case '\r':
            case '\t':
                // Ignore whitespace
                break;

            case '\n':                
                this._currentLine++;
                this._currentLineStartIndex = this._currentPos;

                if (this._tokens.length > 0) {
                    this._tokens[this._tokens.length - 1].followed_by_line_break = true;
                }
                
                break;

            case '"':
                this.processString('"');
                break;
            case '\'':
                this.processString('\'');
                break;
            case '`':
                this.processString('`');
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
                    throw new CompilerError(`Unexpected character ${c} at position ${this._currentPos - this._currentLineStartIndex} on line ${this._currentLine}`);
                }
        }
    }

    private nextChar() : string {
        return this._source.charAt(this._currentPos++);
    }

    private peek(lookAhead = 0) : string {
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

    private _charIsDigitRegex = new RegExp("[0-9]");
    private _charIsAlphaRegex = new RegExp("[A-Za-z_]");

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

        const numberAsString = this._source.substring(this._startOfToken, this._currentPos);
        
        this.addTokenWithLiteral(TokenType.NUMBER, numberAsString);
    }

    private processString(quoteChar:string) : void {

        let extractedString = '';
        let hasProducedAtLeastOneToken = false;

        while(this.peek() != quoteChar && !this.endOfFile())
        { 
            if (quoteChar == '`' && this.peek() == '\n')
            {
                this._currentLine++;
                this._currentLineStartIndex = this._currentPos;
            }
            else if (this.matchNext('\n')) // Peek() == '\n')
            {
                this._currentLine++;
                this._currentLineStartIndex = this._currentPos;

                throw new CompilerError(`Unexpected line break in string on line ${this._currentLine - 1}`);
            }

            if (this.peek() == '\\')
            {
                const next = this.peek(1);

                if (next == '\'' || next == '"' || next == '\\' || next == '{')
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
                if (quoteChar == '`' && this.peek() == '$' && this.peek(1) == '{')
                {
                    // We've just entered the ${} section, so whatever we've got so far, create
                    // a string token and add it to the stream, and then start a new string part

                    if (extractedString.length > 0)
                    {
                        this.addTokenWithLiteral(TokenType.STRING, extractedString);
                        extractedString = '';
                        hasProducedAtLeastOneToken = true;
                    }

                    // Now we'll loop through collecting whatever is inside the ${}

                    this.nextChar();
                    this.nextChar();

                    let embeddedExpr = '';

                    let inEmbeddedString = false;
                    let embeddedStringChar = null; // Was char

                    while ((this.peek() != '}' || inEmbeddedString) && !this.endOfFile())
                    {
                        // Bug here, ${"}"} will currently not do so well

                        if ((embeddedStringChar == null && (this.peek() == '\'' || this.peek() == '"'))
                                || embeddedStringChar != null && this.peek() == embeddedStringChar) // Also `
                        {
                            embeddedStringChar = this.peek();
                            inEmbeddedString = !inEmbeddedString;
                        }

                        embeddedExpr += this.nextChar();
                    }

                    this.nextChar();

                    if (embeddedExpr.length > 0)
                    {
                        // We've just extracted the contents inside the ${}.
                        // Now we create a new scanner and pass it that string and
                        // get back tokens. We will wrap those in parens and, if we've already
                        // generated at least one token so far, we insert a + to concat them.

                        if (hasProducedAtLeastOneToken)
                        {
                            this.addToken(TokenType.PLUS);
                        }

                        const embeddedScanner = new Scanner(embeddedExpr);

                        const embeddedTokens:Token[] = embeddedScanner.scanTokens();

                        this.addToken(TokenType.START_OF_EMBEDDED_STRING_EXPRESSION);

                        for (const t of embeddedTokens)
                        {
                            if (t.type == TokenType.EOF)
                            {
                                break;
                            }

                            this._tokens.push(t);
                        }

                        this.addToken(TokenType.END_OF_EMBEDDED_STRING_EXPRESSION);

                        hasProducedAtLeastOneToken = true;
                    }
                }
                else
                {
                    extractedString += this.nextChar();
                }
            } 
        }

        if (this.endOfFile())
        {
            throw new Error("Unterminated string");
        }

        this.nextChar(); // Consume the closing quote character

        if (extractedString.length > 0 || !hasProducedAtLeastOneToken)
        {
            if (hasProducedAtLeastOneToken)
            {
                this.addToken(TokenType.PLUS);
            }

            this.addTokenWithLiteral(TokenType.STRING, extractedString);
        }
    }

    private processIdentifier() : void {
        
        while(this.charIsAlphaNumeric(this.peek())) this.nextChar(); 

        const identifierAsString = this._source.substring(this._startOfToken, this._currentPos);
        
        if (identifierAsString != "constructor" && this._keywords[identifierAsString] != undefined) {
            this.addTokenWithLiteral(this._keywords[identifierAsString], identifierAsString);
        }
        else {
            this.addTokenWithLiteral(TokenType.IDENTIFIER, identifierAsString);
        }
    }

    private addToken(tokenType:TokenType) : void {
        this.addTokenWithLiteral(tokenType);
    }

    private addTokenWithLiteral(tokenType:TokenType, literal:string|undefined = undefined) : void {
        const lexeme = this._source.substring(this._startOfToken, this._currentPos);

        this._tokens.push(new Token(tokenType, lexeme, literal, this._currentLine, this._previous - this._currentLineStartIndex, this._previous, this._currentPos));
        this._previous = this._currentPos;
    }

}