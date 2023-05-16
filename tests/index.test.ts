import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../src/SmolVM';
import * as fs from 'fs';
import * as path from 'path';

const testFiles:string[] = []; // Keeping a separate array because I can't get keys to work with the dicitonary?!
const tests: { [fileName:string] : { fileData: string, steps: string[] } } = {};
const allFiles = fs.readdirSync(path.join(__dirname, './'), { recursive: true })

const regexTestFileHeader = /\/\*(.*?)(Steps:.*?\n)(.*?)\*\//s;
const regexStepMatcher = /^- (.*?)$/gm;

allFiles.forEach((f) => {
  const fileName = f as string

  if (fileName.endsWith('.test.smol')) {

    const fileData = fs.readFileSync(path.join(__dirname, './', f as string)).toString();

    const testFileHeaderMatch = regexTestFileHeader.exec(fileData);

    if (testFileHeaderMatch != null) {

      const stepsBlock:string = testFileHeaderMatch[3];
      const matchedSteps = stepsBlock.match(regexStepMatcher);

      if (matchedSteps != null) {
        const steps = matchedSteps.map<string>((x) => x.toString());

        tests[fileName] = { fileData: fileData, steps: steps };

        testFiles.push(fileName);
      }
    }
  }
});

const runStepRegex = /- run$/i;
const expectGlobalNumberRegex = /- expect global (.*?) to be number (\d+(\.{0,1}\d+))/i;
const expectGlobalStringRegex = /- expect global (.*?) to be string (.*)/i;
const expectGlobalUndefinedRegex = /- expect global (.*?) to be undefined/i;

describe('Automated Test Suite', () => {

  test.each(testFiles)('%s', (fileName) => {
    const test = tests[fileName];
    const vm = SmolVM.Compile(test.fileData);

    let debugLog = '';

    vm.onDebugPrint = (str) => { debugLog += `${str}\n` };
    
    test.steps.forEach((step) => {

      if (step.match(runStepRegex)) {
        try {
          vm.run();
        }
        catch(e) {
          console.log(test.fileData);
          console.log(vm.decompile());
          console.log(debugLog);
          throw e;
        }
      }
      else if (step.match(expectGlobalNumberRegex)) {
        const m = step.match(expectGlobalNumberRegex);

        if (m == null) {
          throw new Error(`Could not parse ${step}`);
        }

        expect(vm.getGlobalVar(m[1])).toBe(Number(m[2]));        
      }
      else if (step.match(expectGlobalStringRegex)) {
        const m = step.match(expectGlobalStringRegex);

        if (m == null) {
          throw new Error(`Could not parse ${step}`);
        }

        expect(vm.getGlobalVar(m[1])).toBe(String(m[2]));        
      }
      else if (step.match(expectGlobalUndefinedRegex)) {
        const m = step.match(expectGlobalUndefinedRegex);

        if (m == null) {
          throw new Error(`Could not parse ${step}`);
        }

        expect(vm.getGlobalVar(m[1])).toBeUndefined();
      }
      else {
        throw new Error(`Could not parse ${step}`);
      }
    });

  })
});
