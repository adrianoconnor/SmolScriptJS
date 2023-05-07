import { AstDebugPrinter } from '../src/Internals/Ast/AstDebugPrinter'

import {describe, expect, test} from '@jest/globals';


describe('sum module', () => {
  test('adds 1 + 2 to equal 3', () => {

    let source = "var a = 1; if (a > 5) print `over`; else print 'under'; while (a < 10) { a = a + 1; print a; if (a > 5) break; else print ('ok'); }";    
    AstDebugPrinter.parse(source);

    expect(1+2).toBe(3);

});
});