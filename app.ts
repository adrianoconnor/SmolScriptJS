import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { Scanner } from "./Scanner";
import { Parser } from "./Parser";

let s = new Scanner("var a = (1 + 2 * 3); a = a * 5 / 2 + 1;");

s.scanTokens();

/*
s._tokens.forEach(function(t:Token) {
    console.log(t.lexeme, TokenType[t.type]);
});
*/

let p = new Parser(s._tokens);

p.parse();
