import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../src/SmolVM';
import * as fs from 'fs';
import * as path from 'path';

const testFiles:string[] = []; // Keeping a separate array because I can't get keys to work with the dicitonary?!
const tests: { [fileName:string] : { fileData: string, steps: string[] } } = {};

// Recursive is new for node 20 -- that's why we don't auto test on 16/18. We could add something to
// do the same, but it really is not worth the trouble to me personally right now so I'm leaving it
// like this and assuming 20+
const allFiles = fs.readdirSync(path.join(__dirname, '../SmolScriptTests'), { recursive: true })

const regexTestFileHeader = /\/\*(.*?)(Steps:.*?\n)(.*?)\*\//s;
const regexStepMatcher = /^- (.*?)$/gm;

//console.log('Printing contents of SmolScriptTests folder:');
//console.log(allFiles);

allFiles.forEach((f) => {
  const fileName = f as string

  if (fileName.endsWith('.test.smol')) {

    const fileData = fs.readFileSync(path.join(__dirname, '../SmolScriptTests', f as string)).toString();

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
const expectGlobalNumberRegex = /- Expect global (.*?) to be number (\d+(\.{0,1}\d*))/i;
const expectGlobalStringRegex = /- expect global (.*?) to be string (.*)/i;
const expectGlobalBoolRegex = /- expect global (.*?) to be boolean (.*)/i;
const expectGlobalUndefinedRegex = /- expect global (.*?) to be undefined/i;

describe('Automated Test Suite', () => {

  test.each(testFiles)('%s', (fileName) => {

    console.log(fileName);

    const test = tests[fileName];
    const vm = SmolVM.Compile(test.fileData);

    let debugLog = '';

    vm.onDebugPrint = (str) => { debugLog += `${str}\n` };
    
    test.steps.forEach((step) => {

      if (runStepRegex.test(step)) {
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
      else if (expectGlobalNumberRegex.test(step)) {
        const m = step.match(expectGlobalNumberRegex);

        if (m == null) {
          throw new Error(`Could not parse ${step}`);
        }

        expect(vm.getGlobalVar(m[1])).toBe(Number(m[2]));        
      }
      else if (expectGlobalStringRegex.test(step)) {
        const m = step.match(expectGlobalStringRegex);

        if (m == null) {
          throw new Error(`Could not parse ${step}`);
        }

        expect(vm.getGlobalVar(m[1])).toBe(String(m[2]));  
      }
      else if (expectGlobalBoolRegex.test(step)) {
        const m = step.match(expectGlobalBoolRegex);

        if (m == null) {
          throw new Error(`Could not parse ${step}`);
        }

        console.log(m);

        expect(vm.getGlobalVar(m[1])).toBe(Boolean(m[2]));
      }
      else if (expectGlobalUndefinedRegex.test(step)) {
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
