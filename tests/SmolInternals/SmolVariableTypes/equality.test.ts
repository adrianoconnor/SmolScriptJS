import { describe, expect, test } from '@jest/globals';
import { SmolNumber } from '../../../src/Internals/SmolVariableTypes/SmolNumber'
import { SmolBool } from '../../../src/Internals/SmolVariableTypes/SmolBool';

/*
These tests check how the Smol 'wrapped' variable types deal with equality checks in
the host runtime. This is less of an issue for the JS version, because each types'
stored 'value' can be compared directly and we'll just magically inherit the JS
behaviour from the host -- it's more of an issue for .net
*/

describe('SmolInteral VariableTypes', () => {
  test('SmolNumber Equality', () => {

    const n1 = new SmolNumber(1);
    const n2 = new SmolNumber(1);
    const n3 = new SmolNumber(2);
        
    expect(n1.equals(n2)).toBeTruthy(); // This is using our own equality method on the base type
    expect(n1.equals(n3)).toBeFalsy();
    expect(n1 == n2).toBeFalsy(); // This is comparing object instances, which are not the same

    const b1 = new SmolBool(true);
    const b2 = new SmolBool(true);
    const b3 = new SmolBool(false);
    
    expect(b1.equals(b2)).toBeTruthy();
    expect(b1.equals(b3)).toBeFalsy();
    expect(b1 == b2).toBeFalsy();
    expect(b1.getValue()).toBeTruthy();
    expect(b3.getValue()).toBeFalsy();
  });
});