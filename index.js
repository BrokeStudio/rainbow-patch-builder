#!/usr/bin/env node

const program = require("commander");
const log = require("./log.js");
const pkg = require("./package.json");

const patch = require("./patch");

program.version(pkg.version, "-v, --version");

program
  .command("patch")
  .description(`Build "compile.bat" batch file`)
  .arguments("[oldFile] [newFile] [patchFile]")
  .action(function(oldFile, newFile, patchFile) {
    if (oldFile === undefined) {
      log.error("old file path is missing...");
      process.exit(0);
    }
    if (newFile === undefined) {
      log.error("new file path is missing...");
      process.exit(0);
    }
    patch(oldFile, newFile, patchFile);
    process.exit(0);
  });

program.parse(process.argv);

/*
if (typeof program.args[0] === "string") {
  // log
  log.error("Unknown command: " + program.args[0]);
  log.info(`Run "build --help" for help.`);
} else {
  // default behavior
  compile({});
}
*/
