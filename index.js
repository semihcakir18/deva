#!/usr/bin/env node
const { createInterface } = require("readline");
// deva add
let PATH_TO_BE_SAVED = __filename;
let PROJECT_NAME = ""
let COMMAND_TO_RUN = ""
async function askQuestion(question, defaultValue) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(`${question} (default: ${defaultValue}): `, (answer) => {      rl.close();
      resolve(answer || defaultValue);
    });
  });
  

  
}
const PROJECT_NAME_QUESTION = "What is the name of your project?";
let PROJECT_NAME_DEFAULT = PATH_TO_BE_SAVED.split("\\").at(-2);

const COMMAND_TO_RUN_QUESTION = "What command do you want to run to start your project?";
const COMMAND_TO_RUN_DEFAULT = "npm run dev";

// for the name selection of the project
(async () => {
  PROJECT_NAME = await askQuestion(PROJECT_NAME_QUESTION, PROJECT_NAME_DEFAULT);
  COMMAND_TO_RUN = await askQuestion(COMMAND_TO_RUN_QUESTION, COMMAND_TO_RUN_DEFAULT);
  console.log("\nas", PATH_TO_BE_SAVED, "\nproject name:" ,PROJECT_NAME,"\ncommand to run", COMMAND_TO_RUN);
})();
// console.log("deva package : ",PATH_TO_BE_SAVED);
