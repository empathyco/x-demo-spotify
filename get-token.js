const request = require('request'); // "Request" library
const fs = require('fs');

const client_id = 'e61c27b7de0b4f0b82033dc83aeea1e6'; // Your client id
const client_secret = '8a43127983164bb2b270457715e185b1'; // Your secret

// your application requests authorization
const authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    Authorization: 'Basic ' + new Buffer.from(client_id + ':' + client_secret).toString('base64')
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};
request.post(authOptions, function (error, response, body) {
  if (!error && response.statusCode === 200) {
    // use the access token to access the Spotify Web API
    console.log('token updated');
    fs.writeFileSync('.env', `VUE_APP_TOKEN=${body.access_token}`);
  } else {
    console.log(response.statusCode, error);
  }
});
