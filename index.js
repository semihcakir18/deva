#!/usr/bin/env node
/**
 * this project is simple and just need to do two things:
 * -save the path of the project and the command to run it
 * -then be able to run it globally from terminal no matter which directory you are in
 * In the first version i planned to have 3 commands:
 * - deva add : to add a project to the list of projects that can be run globally
 * - deva list : to list all the projects that the user has added
 * - deva run <project name> : to run a project from the list of projects that the user has added
 * Notes To Self:
 * - Dont let user choose the names "add", "list", "run" as project names so we can also run the projects without the run command and directly with deva <project-name>
 * - Have an autocomplete for the project names when the user types deva and then presses tab
 */
// deva add

const path = require("path");
const fs = require("fs");
switch (process.argv[2]) {
  case "add":
    add();
    break;
  case "list":
    console.log("list command");
    break;
  case "run":
    console.log("run command");
    break;
  default:
    console.log("default command");
    break;
}

async function add() {
  const { createInterface } = require("readline");

  const PATH_THAT_SCRIPT_IS_RUNNING = process.cwd();
  let projectName = "";
  let commandToRun = "";
  async function askQuestion(question, defaultValue) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise((resolve) => {
      rl.question(`${question} (default: ${defaultValue}): `, (answer) => {
        rl.close();
        resolve(answer || defaultValue);
      });
    });
  }
  const PROJECT_NAME_QUESTION = "What is the name of your project?";

  //this will only work on windows , find a way to make it work on linux and macos
  let PROJECT_NAME_DEFAULT = PATH_THAT_SCRIPT_IS_RUNNING.split("\\").pop();

  const COMMAND_TO_RUN_QUESTION =
    "What command do you want to run to start your project?";
  const COMMAND_TO_RUN_DEFAULT = "npm run dev";

  // for the name selection of the project

  projectName = await askQuestion(PROJECT_NAME_QUESTION, PROJECT_NAME_DEFAULT);
  commandToRun = await askQuestion(
    COMMAND_TO_RUN_QUESTION,
    COMMAND_TO_RUN_DEFAULT,
  );
  console.log(
    "\npath:",
    PATH_THAT_SCRIPT_IS_RUNNING,
    "\nproject name:",
    projectName,
    "\ncommand to run:",
    commandToRun,
  );
  //adding these infos to json config
  const dataToAdd = {
    path: PATH_THAT_SCRIPT_IS_RUNNING,
    commandToRun: commandToRun,
  };
  let config_path = path.join(__dirname, "config.json");
  console.log("config path : ", config_path);

  //Read the config file
  let data = await readConfigFile(config_path);

  //Parse the data from the config file
  let parsedData = await parseConfigData(data);

  //Put the updated data back into the config file
  parsedData[projectName] = dataToAdd;
  await updateConfigFile(config_path, parsedData);
  console.log("project added successfully");
}

//deva list
/*
 * will be filled
 */

//deva run <project name>
/*
 * will be filled
 */

//Helper functions

// Reads the config file and returns the data as a json object
// Param {string} config_path - the path to the config file
// it does not parse the data , only read
async function readConfigFile(config_path) {
  return new Promise((resolve, reject) => {
    fs.readFile(config_path, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log("data from config file : ", data);
        resolve(data);
      }
    });
  });
}

// parses the data that came from config file
async function parseConfigData(data) {
  return new Promise((resolve, reject) => {
    try {
      let parsedData = JSON.parse(data);
      console.log("parsed data : ", parsedData);
      resolve(parsedData);
    } catch (err) {
      reject(err);
    }
  });
}

// update the config
async function updateConfigFile(config_path, parsedData) {
  return new Promise((resolve, reject) => {
    fs.writeFile(config_path, JSON.stringify(parsedData, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
