// eslint-disable-next-line camelcase
const electron_1 = require('electron');
// eslint-disable-next-line camelcase
const { app } = electron_1;
const http = require('node:http');
const v8 = require('node:v8');
// eslint-disable-next-line camelcase,@typescript-eslint/no-unused-vars
const promises_1 = require('node:timers/promises');

if (app.commandLine.hasSwitch('boot-eval')) {
  // eslint-disable-next-line no-eval
  eval(app.commandLine.getSwitchValue('boot-eval'));
}

app.whenReady().then(() => {
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', chunk => { chunks.push(chunk); });
    req.on('end', () => {
      const js = Buffer.concat(chunks).toString('utf8');
      const vm = require('node:vm');
      (async () => {
        try {
          const script = new vm.Script(js);
          const context = vm.createContext({});
          const result = await Promise.resolve(script.runInContext(context));
          res.end(v8.serialize({ result }));
        } catch (e) {
          res.end(v8.serialize({ error: e.stack }));
        }
      })();
    });
  }).listen(0, '127.0.0.1', () => {
    process.stdout.write(`Listening: ${server.address().port}\n`);
  });
});

setTimeout(() => {
  process.exit(0);
}, 30000);
