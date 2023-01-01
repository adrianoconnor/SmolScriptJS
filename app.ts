import { Scanner } from "./Scanner";
import { Token } from "./Token";
import { TokenType } from "./TokenType";

let s = new Scanner("var a = (1 + 10 * 2);");

s.scanTokens();

s._tokens.forEach(function(t:Token) {
    console.log(t.lexeme, TokenType[t.type]);
});
