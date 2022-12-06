const pug = require("pug");
const fs = require("fs");

// Compile the source code.
const compiledFunction = pug.compileFile("./pug/index.pug");

// Render a set of data.
const html = compiledFunction();

// Write the result to "index.html".
fs.writeFileSync("./docs/index.html", html);
