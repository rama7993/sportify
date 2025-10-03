# 🎵 Sportify - Spotify Clone

A modern, responsive music discovery platform built with Angular 17, featuring real-time Spotify API integration, advanced search capabilities, and a beautiful UI with comprehensive music browsing experience.

## ✨ Features

### 🏠 Dashboard

- **🎵 Enhanced Hero Section**: Interactive hero with music statistics and dual action buttons
- **🆕 New Releases**: Real-time new album releases from Spotify API
- **👥 Trending Artists**: Popular artists with follower counts and diverse search results
- **📂 Music Categories**: Browse music by categories for better discovery
- **🎯 Optimized Loading**: Consolidated loading states with proper error handling

### 🔍 Advanced Search

- **🔍 Multi-Type Search**: Search across tracks, artists, albums, and playlists simultaneously
- **♾️ Smart Infinite Scroll**: Intelligent pagination that prevents unnecessary API calls
- **📊 Real-Time Results Counter**: Shows "Showing X of Y results (Z more available)"
- **⚡ Debounced Search**: 300ms debouncing for optimal performance
- **🎛️ Advanced Filtering**: Filter by specific content types
- **📱 Responsive Search**: Optimized for all screen sizes

### 🎵 Audio Experience

- **🎧 Global Audio Player**: Play tracks from anywhere in the app
- **▶️ Album Preview**: Play first track from albums with proper metadata
- **⏯️ Track Controls**: Play, pause, and progress tracking
- **🔊 Preview Support**: 30-second track previews
- **📱 Mobile Optimized**: Touch-friendly controls

### 🎨 Design & UX

- **🌟 Glassmorphism Design**: Modern frosted glass effects with dark theme
- **📱 Fully Responsive**: Perfect experience on desktop, tablet, and mobile
- **✨ Smooth Animations**: Hover effects and loading states
- **🎯 User-Friendly**: Intuitive navigation and clear visual hierarchy
- **⚡ Performance Optimized**: Fast loading with proper state management

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
       clientId: "your-client-id",
       clientSecret: "your-client-secret",
     },
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

### 🏠 Dashboard Component

- **Hero Section**: Interactive welcome area with music statistics
- **New Releases**: Latest albums from Spotify's new releases API
- **Trending Artists**: Popular artists with follower counts and images
- **Music Categories**: Browse music by categories for discovery
- **Responsive Grid**: Adaptive layouts for all screen sizes

### 🔍 Search Component

- **Real-Time Search**: Debounced search with instant results
- **Multi-Type Filtering**: Search tracks, artists, albums, and playlists
- **Smart Pagination**: Intelligent infinite scroll with proper state management
- **Results Counter**: Real-time display of loaded vs. total results
- **Load More**: Manual and automatic loading of additional results
- **No Results Handling**: Proper empty state management

### 🎵 Audio Player Service

- **Global State Management**: RxJS-based audio state management
- **Track Playback**: Play tracks with proper metadata
- **Album Preview**: Play first track from albums
- **Progress Tracking**: Current time and duration tracking
- **Error Handling**: Graceful handling of playback errors

### 🎨 UI Components

- **Responsive Cards**: Adaptive card layouts for different content types
- **Loading States**: Consolidated loading indicators with proper messaging
- **Interactive Elements**: Hover effects and smooth transitions
- **Mobile Optimization**: Touch-friendly controls and responsive design

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
│   │   ├── dashboard/          # Enhanced dashboard with real APIs
│   │   ├── search/             # Advanced search with smart pagination
│   │   ├── artist/             # Artist detail pages
│   │   ├── track/              # Track detail pages
│   │   ├── album/              # Album detail pages
│   │   └── audio-player/       # Global audio player
│   ├── services/
│   │   └── spotify.service.ts  # Comprehensive Spotify API integration
│   └── app.routes.ts           # Routing configuration
└── environments/               # Environment configurations
```

### 🛠️ Technical Implementation

#### Spotify API Integration

- **Client Credentials Flow**: Secure authentication with Spotify API
- **Comprehensive Endpoints**: Support for tracks, artists, albums, playlists, categories
- **Error Handling**: Robust error handling with fallback mechanisms
- **Rate Limiting**: Proper API usage to avoid rate limits

#### State Management

- **RxJS Observables**: Reactive programming with proper subscription management
- **Loading States**: Consolidated loading state management across components
- **Memory Management**: Proper cleanup of subscriptions to prevent memory leaks

#### Responsive Design

- **CSS Grid**: Modern grid layouts with auto-fit columns
- **Flexbox**: Flexible layouts for complex components
- **Media Queries**: Comprehensive responsive breakpoints
- **Mobile-First**: Optimized for mobile devices with touch-friendly controls

### Available Scripts

- `ng serve` - Start development server
- `ng build` - Build for production
- `ng build --configuration production` - Build with SSR
- `ng test` - Run unit tests
- `npm run serve:ssr:sportify` - Run SSR server locally

### 🎵 Spotify API Endpoints Used

#### Dashboard Features

- **`/browse/new-releases`**: Get latest album releases
- **`/browse/featured-playlists`**: Get Spotify's featured playlists
- **`/browse/categories`**: Get music categories for discovery
- **`/recommendations`**: Get personalized track recommendations

#### Search Features

- **`/search`**: Multi-type search across tracks, artists, albums, playlists
- **`/search?type=track`**: Search specifically for tracks
- **`/search?type=artist`**: Search specifically for artists
- **`/search?type=album`**: Search specifically for albums
- **`/search?type=playlist`**: Search specifically for playlists

#### Audio Features

- **`/albums/{id}/tracks`**: Get tracks from a specific album
- **`/artists/{id}/top-tracks`**: Get artist's most popular tracks
- **`/artists/{id}/albums`**: Get artist's album discography
- **`/artists/{id}/related-artists`**: Get related artists

#### Data Management

- **Client Credentials Authentication**: Secure API access
- **Pagination Support**: Handle large result sets efficiently
- **Error Handling**: Graceful fallbacks for API failures
- **Caching**: Optimized API usage to reduce requests

## 🌟 Recent Improvements & Features

### 🔧 Performance Optimizations

- **Consolidated Loading States**: Single loading system instead of multiple redundant states
- **Smart API Calls**: Prevents unnecessary API requests when all data is loaded
- **Efficient Scroll Detection**: Intelligent scroll handling with proper thresholds
- **Memory Management**: Proper cleanup of subscriptions and resources

### 🎯 User Experience Enhancements

- **Accurate Results Display**: Shows "Showing X of Y results (Z more available)"
- **Better Error Handling**: Graceful fallbacks and user-friendly error messages
- **Loading Feedback**: Clear visual indicators for all loading states
- **Responsive Improvements**: Fixed horizontal overflow and mobile optimization

### 🎵 Audio Features

- **Album Preview**: Click play on albums to hear the first track
- **Proper Metadata**: Track objects include album images and information
- **Loading States**: Visual feedback when loading album tracks
- **Error Recovery**: Fallback mechanisms for failed track loading

### 🔍 Search Improvements

- **Real-Time Counter**: Dynamic display of loaded vs. total results
- **Smart Pagination**: Prevents infinite scroll when no more data available
- **Better State Management**: Consolidated loading states for cleaner UX
- **Accurate No Results**: Only shows when truly no results found

### 📱 Responsive Design Fixes

- **Horizontal Overflow**: Fixed content coming out of containers
- **Grid Optimization**: Better responsive grid behavior
- **Mobile Layout**: Improved mobile experience with proper sizing
- **Touch Optimization**: Better touch targets and interactions

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
