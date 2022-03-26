const dotenv = require('./index')
const { str } = require('envalid')
describe('insert', () => {
  beforeAll(async () => {
    process.env.MY_CONFIG = '123'
  })

  afterAll(async () => {
    delete process.env.MY_CONFIG
  })

  it('should insert a doc into collection', async () => {
    const env = dotenv({
      isPhysicalFile: false,
      variables: {
        MY_CONFIG: 'str()'
      },
      MY_CONFIG: '123'
    })

    expect(env.MY_CONFIG).toEqual('123')
  })
})
