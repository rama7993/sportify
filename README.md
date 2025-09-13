# 🎵 Sportify - Spotify Clone

A modern, responsive Spotify clone built with Angular 17, featuring server-side rendering (SSR) and a beautiful UI with shimmer loading effects.

## ✨ Features

- **🎨 Modern UI/UX**: Glassmorphism design with dark theme
- **🔍 Advanced Search**: Multi-type search with infinite scroll
- **🎵 Audio Player**: Global audio player with controls
- **👤 Artist Profiles**: Detailed artist pages with top tracks and albums
- **📀 Album Views**: Complete album information with track listings
- **🎧 Track Details**: Individual track pages with audio previews
- **📱 Responsive Design**: Works perfectly on all devices
- **⚡ SSR Support**: Server-side rendering for better SEO and performance
- **✨ Shimmer Loading**: Beautiful loading animations throughout

## 🚀 Live Demo

[View Live Demo on Vercel](https://sportify-angular.vercel.app)

## 🛠️ Tech Stack

- **Frontend**: Angular 17 (Standalone Components)
- **Styling**: SCSS with Bootstrap 5
- **Icons**: Font Awesome 6
- **API**: Spotify Web API
- **SSR**: Angular Universal
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sportify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Spotify API credentials**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Copy your Client ID and Client Secret
   - Update `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     spotify: {
       clientId: 'your-client-id',
       clientSecret: 'your-client-secret'
     }
   };
   ```

4. **Run the development server**
   ```bash
   ng serve
   ```

5. **Run with SSR (Server-Side Rendering)**
   ```bash
   ng build --configuration production
   npm run serve:ssr:sportify
   ```

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**
   - `SPOTIFY_CLIENT_ID`: Your Spotify Client ID
   - `SPOTIFY_CLIENT_SECRET`: Your Spotify Client Secret

### Other Platforms

The app can be deployed to any platform that supports Node.js:
- Netlify
- Heroku
- AWS
- Google Cloud Platform

## 🎯 Key Components

### Dashboard
- Featured playlists
- New releases
- Browse categories
- Personalized recommendations

### Search
- Multi-type search (tracks, artists, albums, playlists)
- Infinite scroll pagination
- Real-time search with debouncing
- Advanced filtering options

### Artist Pages
- Artist information and followers count
- Top tracks with play functionality
- Album discography
- Related artists

### Track Pages
- Track details and metadata
- Audio preview player
- Album information
- Artist links

### Album Pages
- Complete track listing
- Album artwork and metadata
- Play individual tracks

## 🎨 Design Features

- **Glassmorphism**: Modern frosted glass effects
- **Dark Theme**: Easy on the eyes with Spotify-inspired colors
- **Shimmer Loading**: Smooth loading animations
- **Responsive Grid**: Adaptive layouts for all screen sizes
- **Hover Effects**: Interactive elements with smooth transitions
- **Typography**: Clean, readable fonts with proper hierarchy

## 🔧 Development

### Project Structure
```
src/
├── app/
│   ├── components/
│   │   ├── dashboard/          # Home dashboard
│   │   ├── search/            # Search functionality
│   │   ├── artist/            # Artist detail pages
│   │   ├── track/             # Track detail pages
│   │   ├── album/             # Album detail pages
│   │   └── audio-player/      # Global audio player
│   ├── services/
│   │   └── spotify.service.ts # Spotify API integration
│   └── app.routes.ts          # Routing configuration
└── environments/              # Environment configurations
```

### Available Scripts

- `ng serve` - Start development server
- `ng build` - Build for production
- `ng build --configuration production` - Build with SSR
- `ng test` - Run unit tests
- `npm run serve:ssr:sportify` - Run SSR server locally

## 🌟 Features in Detail

### Search Functionality
- **Real-time search** with 300ms debouncing
- **Multi-type search** across tracks, artists, albums, and playlists
- **Infinite scroll** for seamless browsing
- **Advanced filtering** by type and popularity

### Audio Player
- **Global state management** with RxJS
- **Play/pause controls** for any track
- **Progress tracking** and duration display
- **Preview URL support** for 30-second clips

### Responsive Design
- **Mobile-first approach** with Bootstrap 5
- **Flexible grid system** that adapts to all screen sizes
- **Touch-friendly controls** for mobile devices
- **Optimized images** with lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for the music data
- [Angular](https://angular.io/) for the amazing framework
- [Bootstrap](https://getbootstrap.com/) for the responsive components
- [Font Awesome](https://fontawesome.com/) for the beautiful icons

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the [Angular documentation](https://angular.io/docs)
- Review the [Spotify Web API documentation](https://developer.spotify.com/documentation/web-api/)

---

**Made with ❤️ and Angular**