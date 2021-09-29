const Log = (message) => {
  var today = new Date();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  console.log(`[${time}] ${message}`);
};

module.exports = { Log };
