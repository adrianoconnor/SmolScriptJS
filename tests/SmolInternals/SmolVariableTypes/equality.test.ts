import { describe, expect, test } from '@jest/globals';
import { SmolNumber } from '../../../src/Internals/SmolVariableTypes/SmolNumber'

describe('SmolInteral VariableTypes', () => {
  test('SmolNumber Equality', () => {

    var n1 = new SmolNumber(1);
    var n2 = new SmolNumber(1);
    var n3 = new SmolNumber(2);
        
    expect(n1.equals(n2)).toBeTruthy(); // This is using our own equality method on the base type
    expect(n1.equals(n3)).toBeFalsy();
    expect(n1 == n2).toBeFalsy(); // This is comparing object instances, which are not the same
  });
});