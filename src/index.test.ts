import dotenv from './dotenvy'
describe('insert', () => {
  beforeAll(async () => {
    process.env.MY_CONFIG = '123'
    // write env file
  })

  afterAll(async () => {
    delete process.env.MY_CONFIG
    // delete env file
  })

  it('should read object', async () => {
    const options = {

    }
    const env = dotenv({
      isPhysicalFile: false,
      lines: {
        MY_CONFIG: 'str()',
        MY_CONFIG_N: 'num(0)',
        ANY_STR: 'str()'
      },
      env: {
        MY_CONFIG: '123',
        ANY_STR: 'ABC'
      }
    })

    expect(env.MY_CONFIG).toEqual('123')
    expect(env.MY_CONFIG_N).toEqual(0)
    expect(env.ANY_STR).toEqual('ABC')
  })
})
