const path = require('path');

console.error(`

  This project is not a library. 
  Please read file://${path.join(__dirname, 'README.md')} .

`);

process.exit(1);
