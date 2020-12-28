const index = require('./index')
const path = require('path')

const testOptions = {
  dir: path.resolve(__dirname, '../demo')
}

test('should return options', () => {
  expect(index(testOptions).toBe({

  }))
})
