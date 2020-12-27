# dotenvyjs

DotEnvyJs is a wrapper utility around `envalid` and `dotconfig`.

It turns out that this utility reads a .env.example file and converts the instructions into an object that will be sent to `envalid`

## Installation

```shell
npm install --save jpolvora/dotenvyjs
```

# WorkFlow

Create a file named `.env.example` that can be commited and shared across the team.

Place you keys and values of your application in form of an example / validator.
The format is `ENV_KEY=validator_name(defaultValue,choice1|choice2|choiceN...)`

Check below an example of a `.env.example` file:

```env
# .env.example

API_KEY=str(123)
CI_ENV=str(,development|production)
```

All validators are envalid validators.

# Usage

```javascript
const dotenvyjs = require('dotenvyjs')

const envalidOptions = {
  strict: true
}

const options = {
  exampleFile: '.env.example',
  dir: __dirname,
  ...envalidOptions
}
const env = dotenvyjs(options)

module.exports = {
    ...env
}

```
