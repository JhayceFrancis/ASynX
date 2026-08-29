const { doubleCsrf } = require("csrf-csrf");
console.log(Object.keys(doubleCsrf({ getSecret: () => "secret" })));
