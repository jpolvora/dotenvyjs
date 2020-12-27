const dotenvyjs = require('../src')
const env = dotenvyjs()

console.log(env)
// eslint-disable-next-line no-debugger
if (env.isProd) debugger
