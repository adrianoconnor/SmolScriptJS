import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { Scanner } from "./Scanner";
import { Parser } from "./Parser";
import { Interpreter } from "./Interpreter";

//let s = new Scanner("var a = (1 + 2 * 3); a = a * 5 / 2 + 1; print a;");
let s = new Scanner("print \"test: \" + (1 + 2 * 3);");

s.scanTokens();

/*
s._tokens.forEach(function(t:Token) {
    console.log(t.lexeme, TokenType[t.type]);
});
*/

let p = new Parser(s._tokens);

p.parse();

let i = new Interpreter();

i.run(p._statements);

