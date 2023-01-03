import { AstDebugPrinter } from "./AstDebugPrinter";
import { SmolEngine } from "./SmolEngine";

//let s = new Scanner("var a = (1 + 2 * 3); a = a * 5 / 2 + 1; print a;");
//let s = new Scanner("print \"test: \" + (1 + 2 * 3);");
//let s = new Scanner("var a = 1; while (a < 10) { a = a + 1; print a; if (a > 5) break; }");

var code = "function go_moo(p) { p(); } go_moo(function(x) { print 'zzzz'; });"
//var code = "function go_moo(p) { p('hi'); } go_moo(function(x) { print 'zzzz'; });" // Does not work


AstDebugPrinter.parse(code);

let smol = new SmolEngine();

let prog = smol.compile(code);

smol.execute(prog);