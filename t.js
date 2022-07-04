const waitOn = require('wait-on')

delete process.env.http_proxy

waitOn({
  resources: ['http-get://localhost:3000'],
})
  .then((res) => {
    console.log('@@@@ok', res)
  })
  .catch((err) => {
    console.log('@@@@err', err)
  })
