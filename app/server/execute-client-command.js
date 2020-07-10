// can be used to execute npm commands on the client project
process.argv.splice(0, 2);
const args = process.argv;

const opts = { stdio: 'inherit', cwd: '../client', shell: true };
require('child_process').spawn('npm', args, opts);
