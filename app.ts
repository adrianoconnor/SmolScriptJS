import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { Scanner } from "./Scanner";
import { Parser } from "./Parser";
import { Interpreter } from "./Interpreter";

//let s = new Scanner("var a = (1 + 2 * 3); a = a * 5 / 2 + 1; print a;");
//let s = new Scanner("print \"test: \" + (1 + 2 * 3);");
//let s = new Scanner("var a = 1; while (a < 10) { a = a + 1; print a; if (a > 5) break; }");
let s = new Scanner("function go_moo(p) { p(); } go_moo(function(x) { print 'zzzz'; });");
let a = 'test';

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

