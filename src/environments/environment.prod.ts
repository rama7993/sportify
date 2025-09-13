export const environment = {
  production: true,
  spotify: {
    clientId: process.env['SPOTIFY_CLIENT_ID'] || '5705e43cb6af4b79be9b46229d29fd58',
    clientSecret: process.env['SPOTIFY_CLIENT_SECRET'] || '128c5e60b061432cad4677d49805370a'
  }
};
