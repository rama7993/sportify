export const environment = {
  production: true,
  spotify: {
    clientId: process.env['SPOTIFY_CLIENT_ID'] || 'your-client-id-here',
    clientSecret: process.env['SPOTIFY_CLIENT_SECRET'] || 'your-client-secret-here'
  }
};
