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
 * - Have an autocomplete for the project names when the user types deva and then presses tab
 */
// deva add
const path = require("path");
const fs = require("fs");
const PATH_THAT_SCRIPT_IS_RUNNING = process.cwd();
let projectName = "";
let commandToRun = "";
const os = require("os");
let configPath = path.join(os.homedir(), ".deva", "config.json");
let forbiddenProjectNames = ["add", "list", "run"];
let argumentIndexToRun = 2; // if the user uses run command then project name will be from index 3 onwards , if not it will be from index 2
async function main() {
  //Read the config file
  let data = await readConfigFile(configPath);

  //Parse the data from the config file
  let parsedData = await parseConfigData(data, configPath);

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
    case "-h":
    case "--help":
      // put here a the commands that can be run , like a --help command
      console.log("please enter a command");
      break;
    default:
      argumentIndexToRun = 2;
      run();
      break;
  }
  //deva add
  async function add() {
    async function askQuestion(question, defaultValue) {
      const { createInterface } = require("readline");
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
    while (forbiddenProjectNames.includes(projectName)) {
      console.log(
        `The project name "${projectName}" is not allowed. Please choose a different name.`,
      );
      projectName = await askQuestion(
        PROJECT_NAME_QUESTION,
        PROJECT_NAME_DEFAULT,
      );
    }
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
      detached: false,
      windowsHide: false,
    };

    //Update the data and push it to the config file
    parsedData[projectName] = dataToAdd;
    await updateConfigFile(configPath, parsedData);
    console.log("project added successfully");
  }

  //deva list
  async function list() {
    if (process.argv[3]) {
      console.log("Project details : ", parsedData[process.argv[3]]);
    } else {
      console.log("list of projects : ", Object.keys(parsedData));
    }
  }

  //deva run <project name>
  async function run() {
    let projects = Object.keys(parsedData);
    let projectName = process.argv.slice(argumentIndexToRun).join(" ");
    if (!projects.includes(projectName)) {
      console.log("project not found");
      return;
    }
    let project = parsedData[projectName];
    let commandParts = project.commandToRun.split(" ");
    let command = commandParts[0];
    let args = commandParts.slice(1);

    let spawnOptions = {
      cwd: project.path,
      detached: project.detached,
      windowsHide: project.windowsHide,
      shell: true,
    };

    const { spawn } = require("node:child_process");
    const child = spawn(command, args, spawnOptions);
    child.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }
}
main();
//Helper functions

// Reads the config file and returns the data as a json object
// Param {string} configPath - the path to the config file
// it does not parse the data , only read
async function readConfigFile(configPath) {
  return new Promise((resolve, reject) => {
    fs.readFile(configPath, "utf8", (err, data) => {
      if (err && err.code === "ENOENT") {
        // If the file does not exist, create the directory and file
        const configDir = path.dirname(configPath);
        fs.mkdir(configDir, { recursive: true }, (mkdirErr) => {
          if (mkdirErr) {
            reject(mkdirErr);
          } else {
            fs.writeFile(
              configPath,
              JSON.stringify({}, null, 2),
              (writeErr) => {
                if (writeErr) {
                  reject(writeErr);
                } else {
                  resolve("{}");
                }
              },
            );
          }
        });
      } else if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// parses the data that came from config file
async function parseConfigData(data, configPath) {
  return new Promise((resolve, reject) => {
    try {
      let parsedData = JSON.parse(data);
      resolve(parsedData);
    } catch (err) {
      if (err instanceof SyntaxError) {
        // Config file is corrupted - create backup and reset
        const backupPath = configPath.replace(".json", ".backup.json");

        // Rename corrupted file to backup
        fs.rename(configPath, backupPath, (renameErr) => {
          if (renameErr) {
            console.error(
              "Warning: Could not create backup of corrupted config file",
            );
          } else {
            console.warn(
              `\nWarning: config.json was corrupted and has been backed up to ${backupPath}`,
            );
          }

          // Create fresh config file
          fs.writeFile(configPath, JSON.stringify({}, null, 2), (writeErr) => {
            if (writeErr) {
              reject(writeErr);
            } else {
              console.log("A fresh config file has been created.\n");
              resolve({});
            }
          });
        });
      } else {
        reject(err);
      }
    }
  });
}

// update the config
async function updateConfigFile(configPath, parsedData) {
  return new Promise((resolve, reject) => {
    fs.writeFile(configPath, JSON.stringify(parsedData, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
