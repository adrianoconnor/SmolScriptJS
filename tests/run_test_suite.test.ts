import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../src/SmolVM';
import * as fs from 'fs';
import * as path from 'path';

interface TestCase {
  fileData: string;
  steps: string[];
}

const tests: Record<string, TestCase> = {};

const regexTestFileHeader = /\/\*(.*?)(Steps:.*?\n)(.*?)\*\//s;
const regexStepMatcher = /^- (.*?)$/gm;

function loadTests(rootFolder: string) {
  const files = fs.readdirSync(rootFolder, { recursive: true }) as string[];

  for (const relativePath of files) {
    if (!relativePath.endsWith('.test.smol')) continue;

    const fullPath = path.join(rootFolder, relativePath);
    if (!fs.statSync(fullPath).isFile()) continue;

    const fileData = fs.readFileSync(fullPath, 'utf-8');
    const headerMatch = regexTestFileHeader.exec(fileData);

    if (headerMatch?.[3]) {
      const matchedSteps = headerMatch[3].match(regexStepMatcher);
      if (matchedSteps) {
        tests[relativePath] = {
          fileData,
          steps: matchedSteps.map((s) => s.trim()),
        };
      }
    }
  }
}

const runStepRegex = /^- run$/i;
const expectGlobalNumberRegex = /^- expect global (.*?) to be number (-?\d+(\.\d*)?)/i;
const expectGlobalStringRegex = /^- expect global (.*?) to be string(?: (.*))?$/i;
const expectGlobalBoolRegex = /^- expect global (.*?) to be boolean (.*)/i;
const expectGlobalUndefinedRegex = /^- expect global (.*?) to be undefined/i;

describe('Automated Test Suite', () => {
  const testsDir = path.join(__dirname, '../SmolScriptTests');
  loadTests(testsDir);

  const testCases = Object.keys(tests).flatMap((file) => [
    { file, removeSemicolons: false, label: `${file} (semicolons)` },
    { file, removeSemicolons: true, label: `${file} (no semicolons)` },
  ]);

  test.each(testCases)('$label', ({ file, removeSemicolons }) => {
    runTest(file, removeSemicolons);
  });
});


function runTest(fileName: string, removeSemicolons: boolean = false) {
  const currentTest = tests[fileName];
  let source = currentTest.fileData;

  if (removeSemicolons) {
    source = source.replace(/(?<!(for\(.*?;.*?)|for\(.*?);/g, '');
  }

  const vm = SmolVM.Compile(source);
  vm.maxCycles = 300000;
  vm.maxStackSize = 1000;

  let debugLog = '';
  vm.onDebugPrint = (str) => { debugLog += `${str}\n`; };

  for (const step of currentTest.steps) {
    if (runStepRegex.test(step)) {
      try {
        vm.run();
      } catch (e) {
        console.error(`Source:\n${source}`);
        console.error(`Decompiled:\n${vm.decompile()}`);
        console.error(`Debug Log:\n${debugLog}`);
        throw e;
      }
    } else if (expectGlobalNumberRegex.test(step)) {
      const [, varName, val] = step.match(expectGlobalNumberRegex) ?? [];
      expect(vm.getGlobalVar(varName)).toBe(Number(val));
    } else if (expectGlobalStringRegex.test(step)) {
      const [, varName, val = ''] = step.match(expectGlobalStringRegex) ?? [];
      expect(String(vm.getGlobalVar(varName))).toBe(String(val));   
    } else if (expectGlobalBoolRegex.test(step)) {
      const [, varName, val] = step.match(expectGlobalBoolRegex) ?? [];
      expect(vm.getGlobalVar(varName)).toBe(val.toLowerCase() === 'true');
    } else if (expectGlobalUndefinedRegex.test(step)) {
      const [, varName] = step.match(expectGlobalUndefinedRegex) ?? [];
      expect(vm.getGlobalVar(varName)).toBeUndefined();
    } else {
      throw new Error(`Could not parse step: "${step}" in test: ${fileName}`);
    }
  }
}
