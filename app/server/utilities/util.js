const Log = (message) => {
  var today = new Date();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  console.log(`[${time}] ${message}`);
};

const Warning = (message) => {
  var today = new Date();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  console.log(`[${time}] [Warning] ${message}`);
};

const Error = (message) => {
  var today = new Date();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  console.log(`[${time}] [Error] ${message}`);
};

module.exports = { Log, Warning, Error };
