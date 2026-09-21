import { describe, expect, test } from '@jest/globals';
import { Compiler } from '../../../src/Internals/Compiler';

describe('Example benchmark', () => {
  test('Benchmark1', () => {

    const source = `
    function arith(n) {
    var x = 12345;
    var sum = 0;
    var i = 0;

    while (i < n) {
        x = (x * 110351 + 12345) % 1000003;
        sum = (sum + (x % 97)) % 1000003;
        i = i + 1;
    }

    return sum;
}

function fib(n) {
    if (n < 2) {
        return n;
    }

    return fib(n - 1) + fib(n - 2);
}

function sieve(n) {
    var a = [];
    var i = 0;

    while (i <= n) {
        a[i] = 1;
        i = i + 1;
    }

    a[0] = 0;
    a[1] = 0;

    var p = 2;

    while (p * p <= n) {
        if (a[p]) {
            var j = p * p;

            while (j <= n) {
                a[j] = 0;
                j = j + p;
            }
        }

        p = p + 1;
    }

    var count = 0;
    i = 0;

    while (i <= n) {
        if (a[i]) {
            count = count + 1;
        }

        i = i + 1;
    }

    return count;
}

function makeTree(depth, value) {
    var node = {
        value: value,
        left: null,
        right: null
    };

    if (depth > 0) {
        node.left = makeTree(depth - 1, value * 2 + 1);
        node.right = makeTree(depth - 1, value * 2 + 2);
    }

    return node;
}

function sumTree(node) {
    if (node == null) {
        return 0;
    }

    return node.value + sumTree(node.left) - sumTree(node.right);
}

function treeBench(depth, iterations) {
    var sum = 0;
    var i = 0;

    while (i < iterations) {
        var t = makeTree(depth, i);
        sum = sum + sumTree(t);
        i = i + 1;
    }

    return sum;
}

function runBenchmark(scale) {
    var checksum = 0;

    checksum = checksum + arith(scale * 20000);
    checksum = checksum + sieve(scale * 1000);
    checksum = checksum + fib(20);
    checksum = checksum + treeBench(7, scale * 10);

    return checksum;
}

var result = runBenchmark(10);
    `;

    const c = new Compiler();
    const prog = c.Compile(source);

    expect(prog.constants.length).toBe(5);
  });
});