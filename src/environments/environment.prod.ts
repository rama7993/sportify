export const environment = {
  production: true,
  spotify: {
    clientId: process.env['SPOTIFY_CLIENT_ID'],
    clientSecret: process.env['SPOTIFY_CLIENT_SECRET'],
  },
  backendApiUrl: process.env['BACKEND_API_URL'],
};
