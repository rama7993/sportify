export const environment = {
  production: true,
  spotify: {
    clientId: process.env['SPOTIFY_CLIENT_ID'],
    clientSecret: process.env['SPOTIFY_CLIENT_SECRET'],
  },
  backendApiUrl: 'https://sportify-backend-beta.vercel.app/api/spotify',
};
