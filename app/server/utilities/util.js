const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

const Log = (message) => {
  const today = new Date();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  console.log(`[${time}] ${message}`);
};

const Warning = (message) => {
  const today = new Date();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  console.log(`[${time}] [Warning] ${message}`);
};

const Error = (message) => {
  const today = new Date();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  console.log(`[${time}] [Error] ${message}`);
};

/**
 * @function getGitRevision
 * Gets the current git revision hash
 * @see {@link https://stackoverflow.com/a/34518749}
 * @returns {string} The git revision hash, or empty string
 */
const getGitRevision = () => {
  try {
    const gitDir = (() => {
      let dir = '.git', i = 0;
      while (!existsSync(join(__dirname, dir)) && i < 5) {
        dir = '../' + dir;
        i++;
      }
      return dir;
    })();

    const head = readFileSync(join(__dirname, `${gitDir}/HEAD`)).toString().trim();
    return (head.indexOf(':') === -1)
      ? head
      : readFileSync(join(__dirname, `${gitDir}/${head.substring(5)}`)).toString().trim();
  } catch (err) {
    Warning(err.message);
    return '';
  }
};

module.exports = { Log, Warning, Error, getGitRevision };
