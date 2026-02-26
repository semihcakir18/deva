#!/usr/bin/env node
/**
 * this project is simple and just need to do two things:
 * - save the path of the project and the command to run it
 * - then be able to run it globally from terminal no matter which directory you are in
 * In the first version i planned to have 3 commands:
 * - deva add : to add a project to the list of projects that can be run globally
 * - deva list : to list all the projects that the user has added
 * - deva run <project name> : to run a project from the list of projects that the user has added
 * Notes To Self:
 * - Optimize the data read and parsing , level it up to main function
 * - Dont let user choose the names "add", "list", "run" as project names so we can also run the projects without the run command and directly with deva <project-name>
 * - Have an autocomplete for the project names when the user types deva and then presses tab
 */
// deva add
const path = require("path");
const fs = require("fs");
const PATH_THAT_SCRIPT_IS_RUNNING = process.cwd();
let projectName = "";
let commandToRun = "";
let config_path = path.join(__dirname, "config.json");
async function main() {
  // this is the wrapper function so we can call async functions without the top-level await error

  //Read the config file
  let data = await readConfigFile(config_path);

  //Parse the data from the config file
  let parsedData = await parseConfigData(data);
  switch (process.argv[2]) {
    case "add":
      add();
      break;
    case "list":
      list();
      break;
    case "run":
      run();
      break;
    case undefined:
      // put here a the commands that can be run , like a --help command
      console.log("please enter a command");
      break;
    default:
      console.log("default command");
      break;
  }
  //deva add
  async function add() {
    const { createInterface } = require("readline");

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

    let PROJECT_NAME_DEFAULT = path.basename(PATH_THAT_SCRIPT_IS_RUNNING);

    const COMMAND_TO_RUN_QUESTION =
      "What command do you want to run to start your project?";
    const COMMAND_TO_RUN_DEFAULT = "npm run dev";

    // for the name selection of the project

    projectName = await askQuestion(
      PROJECT_NAME_QUESTION,
      PROJECT_NAME_DEFAULT,
    );
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

    //Update the data and push it to the config file
    parsedData[projectName] = dataToAdd;
    await updateConfigFile(config_path, parsedData);
    console.log("project added successfully");
  }

  //deva list
  async function list() {
    console.log("list of projects : ", Object.keys(parsedData));
  }

  //deva run <project name>
  async function run() {
    //Parse the data from the config file
    let parsedData = await parseConfigData(data);
    let projects = Object.keys(parsedData);
    let projectName = process.argv[3];
    if (!projects.includes(projectName)) {
      console.log("project not found");
      return;
    }
    let commandToRun = parsedData[projectName].commandToRun;
    console.log("command to run : ", commandToRun);
    let pathToRun = parsedData[projectName].path;
    console.log("path to run : ", pathToRun);

    const { exec } = require("child_process");
    exec(commandToRun, { cwd: pathToRun }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return;
      }
      console.log(stdout);
    });
  }
}
main();
//Helper functions

// Reads the config file and returns the data as a json object
// Param {string} config_path - the path to the config file
// it does not parse the data , only read
async function readConfigFile(config_path) {
  return new Promise((resolve, reject) => {
    fs.readFile(config_path, "utf8", (err, data) => {
      if (err && err.code === "ENOENT") {
        // If the file does not exist, create it with an empty object
        fs.writeFile(config_path, JSON.stringify({}, null, 2), (err) => {
          if (err) {
            reject(err);
          } else {
            resolve("{}");
          }
        });
      } else if (err) {
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
