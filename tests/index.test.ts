import { AstDebugPrinter } from '../src/Internals/Ast/AstDebugPrinter'

import {describe, expect, test} from '@jest/globals';


describe('Scratch Pad', () => {
  test('AST Debug Print for dev', () => {

    let source = `
    function test() { }

    var a = function(x) { return x+1*2; };
   
    var a = 10;
    
    if (a > 5) {
      print 'a is > 5'; 
    } 
    else {
      print 'a is <= 5';
    }
    
    while (a < 20) { 
      a = a + 1;
      print a; 
      if (a > 15) 
        break; 
      else 
        print ('ok');
    }

    var b = function() {
      print x == 1 ? 'y' : 'n';
    };

    b(123);
`;

    var ast = AstDebugPrinter.parse(source);

    console.log(ast);

    //var a = source;

    //expect(1+2).toBe(3);

  });
});