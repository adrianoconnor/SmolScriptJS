import { AstDebugPrinter } from '../src/Internals/Ast/AstDebugPrinter'

import {describe, expect, test} from '@jest/globals';


describe('', () => {
  test('', () => {

    let source = `
    var a = 10;
    
    if (a > 5) {
      print 'a is > 5'; 
    } 
    else {
      print 'a is <= 5';
    }
    // while (a < 10) { a = a + 1; print a; if (a > 5) break; else print ('ok'); }
`;

    AstDebugPrinter.parse(source);

    //var a = source;

    //expect(1+2).toBe(3);

  });
});