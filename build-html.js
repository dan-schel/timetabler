const pug = require("pug");
const fs = require("fs");

// Compile the source code.
const compiledFunction = pug.compileFile("./pug/index.pug");

// Render a set of data.
const html = compiledFunction();

if (!fs.existsSync("./build")) {
  fs.mkdirSync("./build");
}

// Write the result to "index.html".
fs.writeFileSync("./build/index.html", html);
