import { AstDebugPrinter } from "./AstDebugPrinter";
import { SmolEngine } from "./SmolEngine";

//let s = new Scanner("var a = (1 + 2 * 3); a = a * 5 / 2 + 1; print a;");
//let s = new Scanner("print \"test: \" + (1 + 2 * 3);");
let source = "var a = 1; if (a > 5) print 'over'; else print 'under'; while (a < 10) { a = a + 1; print a; if (a > 5) break; else print ('ok'); }";

var code = "function go_moo(p) { p(); } go_moo(function(x) { print 'zzzz'; });"
//var code = "function go_moo(p) { p('hi'); } go_moo(function(x) { print 'zzzz'; });" // Does not work


AstDebugPrinter.parse(source);

let smol = new SmolEngine();

let prog = smol.compile(source);

smol.execute(prog);