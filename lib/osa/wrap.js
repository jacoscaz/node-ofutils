// The following code largely derives from that of the osa2 package, released
// under the MIT license. For more information, see the following:
// - https://www.npmjs.com/osa2
// - https://github.com/wtfaremyinitials/osa2

const childProcess = require('child_process');

const wrap = (fn) => {

  const code = `
    ObjC.import('stdlib');
    var fn   = (${fn.toString()});
    var args = JSON.parse($.getenv('OSA_ARGS'));
    var out  = fn.apply(null, args);
    JSON.stringify(out);
  `;

  const wrappedFn = (...args) => {
    return new Promise((resolve, reject) => {
      const child = childProcess.execFile(
        '/usr/bin/osascript',
        ['-l', 'JavaScript'],
        {
          env: {
            OSA_ARGS: JSON.stringify(args),
          },
        },
        (err, stdout, stderr) => {
          if (err) {
            reject(err);
            return;
          }

          if (stderr) {
            console.log(stderr);
          }

          if (!stdout) {
            resolve(undefined);
            return;
          }

          try {
            resolve(JSON.parse(stdout.toString()));
          } catch (err) {
            reject(err);
          }
        }
      );
      child.stdin.write(code);
      child.stdin.end();
    });
  };
  return wrappedFn;
};

module.exports = wrap;
