const fs = require('fs')
const path = require('path')
const envalid = require('envalid')

const defaultOptions = {
  exampleFile: '.env.example',
  dir: path.resolve('./'),
  strict: true
}

function findValidator (name) {
  if (typeof envalid[name] === 'function') {
    return envalid[name]
  }

  return false
}

function extract ([beg, end]) {
  const matcher = new RegExp(`\\${beg}(.*?)\\${end}`, 'gm')
  const normalise = (str) => str.slice(beg.length, end.length * -1)
  return function (str) {
    return str.match(matcher).map(normalise)
  }
}

const parameterExtractor = extract(['(', ')'])

function getValidatorInfo (value) {
  const result = {
    name: '',
    default: false,
    choices: false
  }

  try {
    const params = parameterExtractor(value)
    if (params.length > 0) {
      result.name = value.substr(0, value.indexOf('(')).toLowerCase()
      const splited = params[0].split(',')
      result.default = splited[0]
      const choices = splited[1].split('|')
      if (choices.length > 0) {
        result.choices = choices
      }
    } else {
      result.name = value
    }
  } catch (error) {

  }

  return result
}

function parseLine (line) {
  if (!line) return false
  if (line.trim().length === 0) return false
  try {
    const instruction = line.split('#')[0].trim()
    if (instruction.length === 0) return false
    const [key, value] = line.split('=')
    if (key && value) {
      const result = {
        key, value
      }
      const validatorInfo = getValidatorInfo(value)
      if (validatorInfo && validatorInfo.name) {
        const validatorFn = findValidator(validatorInfo.name)
        if (validatorFn) {
          const options = {}
          if (validatorInfo.default) options.default = validatorInfo.default
          if (validatorInfo.choices) options.choices = validatorInfo.choices
          result.key = key
          result.value = validatorFn(options)
        }
      }
      return result
    }
  } catch (error) {
  }
  return false
}

function processLineByLine (lines) {
  const cfg = {}
  for (const line of lines) {
    const parsedConfig = parseLine(line)
    if (parsedConfig) {
      cfg[parsedConfig.key] = parsedConfig.value
    }
  }

  return cfg
}

function getFileContents (filename) {
  try {
    const contents = fs.readFileSync(filename, 'utf8')
    const lines = contents.split('\n')
    return lines
  } catch (error) {
    throw new Error(`Couldn\'t read file "${filename}": ` + error.message)
  }
}

const main = (options) => {
  try {
    const finalOptions = Object.assign({}, defaultOptions, options)
    const exampleFileName = path.join(finalOptions.dir, finalOptions.exampleFile)
    const lines = getFileContents(exampleFileName)
    const config = processLineByLine(lines)
    return envalid.cleanEnv(process.env, config, finalOptions)
  } catch (ex) {
    throw new Error('Error running dotenvyjs: ' + ex)
  }
}

main.getFileContents = getFileContents
main.processLineByLine = processLineByLine
main.parseLine = parseLine
main.getValidatorInfo = getValidatorInfo
main.findValidator = findValidator
module.exports = main
