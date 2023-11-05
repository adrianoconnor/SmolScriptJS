import { describe, expect, test } from '@jest/globals';
import { SmolVM } from '../src/SmolVM';
import * as fs from 'fs';
import * as path from 'path';

const testFiles:string[] = []; // Keeping a separate array because I can't get keys to work with the dicitonary?!
const tests: { [fileName:string] : { fileData: string, steps: string[] } } = {};

const regexTestFileHeader = /\/\*(.*?)(Steps:.*?\n)(.*?)\*\//s;
const regexStepMatcher = /^- (.*?)$/gm;

function findTestsRecursive(folderPath:string) {
  
  var files = fs.readdirSync(folderPath, { recursive: true })

  files.forEach((f) => {
    const fileName = f as string
    const fullPath = path.join(folderPath, fileName);
    //console.log(`${folderPath}, ${fileName}`);
  
    if (!fileName.startsWith('.') && fs.statSync(fullPath).isDirectory()) {
      findTestsRecursive(fullPath);
    }

    if (fileName.endsWith('.test.smol')) {

      //const fileData = fs.readFileSync(path.join(__dirname, '../SmolScriptTests', f as string)).toString();
      const fileData = fs.readFileSync(fullPath).toString();

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
}

const runStepRegex = /- run$/i;
const expectGlobalNumberRegex = /- expect global (.*?) to be number (-{0,1}\d+(\.{0,1}\d*))/i;
const expectGlobalStringRegex = /- expect global (.*?) to be string (.*)/i;
const expectGlobalBoolRegex = /- expect global (.*?) to be boolean (.*)/i;
const expectGlobalUndefinedRegex = /- expect global (.*?) to be undefined/i;
const repeatWithoutSemicolonsRegex = /- /i;

describe('Automated Test Suite', () => {

  findTestsRecursive(path.join(__dirname, '../SmolScriptTests'));

  test.each(testFiles)('%s', (fileName) => {

    runTest(fileName, false);
    runTest(fileName, true);

  })
});

function runTest(fileName:string, removeSemicolons:boolean = false) {
    const currentTest = tests[fileName];

    let source = currentTest.fileData;

    if (removeSemicolons) {
      source = source.replace(/(?<!(for\(.*?;.*?)|for\(.*?);/g, '') // This won't work for a 'for' statement followed by a statement on the same line (it'll just leave the following ;'s there)
    }

    const vm = SmolVM.Compile(source);

    vm.maxCycles = 300000;
    vm.maxStackSize = 1000;

    let debugLog = '';

    vm.onDebugPrint = (str) => { debugLog += `${str}\n` };
    
    currentTest.steps.forEach((step) => {

      if (runStepRegex.test(step)) {
        try {
          vm.run();
        }
        catch(e) {
          console.log(source);
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
        
        try {
          expect(vm.getGlobalVar(m[1]).toString()).toBe(String(m[2]));                
        }
        catch(e)
        {
          console.log(`Failed checking value of ${m[1]} in test ${fileName}`);
          throw e;
        }
      }
      else if (expectGlobalBoolRegex.test(step)) {
        const m = step.match(expectGlobalBoolRegex);

        if (m == null) {
          throw new Error(`Could not parse ${step}`);
        }

        expect(vm.getGlobalVar(m[1])).toBe(m[2].toLowerCase() == 'true');
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
}