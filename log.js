const chalk = require("chalk");

module.exports = {
  warning: msg => {
    console.log(chalk.yellow(msg));
  },

  error: msg => {
    console.log(chalk.red(msg));
  },

  info: msg => {
    console.log(chalk.cyan(msg));
  },

  print: msg => {
    console.log(msg);
  }
};
