import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { SpotifyService } from '../../../services/spotify.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  newReleases: any[] = [];
  trendingArtists: any[] = [];
  recommendations: any[] = [];
  categories: any[] = [];
  recommendationsLoaded = false;
  loading = {
    newReleases: true,
    artists: true,
    recommendations: true,
    categories: true,
  };
  playingAlbumId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private spotifyService: SpotifyService, private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
    // Load recommendations automatically after a short delay
    setTimeout(() => {
      this.loadRecommendations();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    // Load real data from Spotify API using proper endpoints
    this.loadNewReleases();
    this.loadTrendingArtists();
    this.loadCategories();

    // Load recommendations automatically after a short delay
    setTimeout(() => {
      this.loadRecommendations();
    }, 1000);
  }

  private loadNewReleases(): void {
    // Use Spotify's new releases API
    this.spotifyService
      .getNewReleases(8, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.newReleases = response.albums?.items || [];
          this.loading.newReleases = false;
        },
        error: (err) => {
          console.error('Error loading new releases', err);
          this.newReleases = [];
          this.loading.newReleases = false;
        },
      });
  }

  private loadTrendingArtists(): void {
    // Search for popular artists using multiple queries to get diverse results
    this.spotifyService
      .search({ query: 'top artists', type: 'artist', limit: 4 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const artists1 = response.artists?.items || [];

          // Get more artists with different search terms
          this.spotifyService
            .search({ query: 'trending artists', type: 'artist', limit: 4 })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response2) => {
                const artists2 = response2.artists?.items || [];
                // Combine and deduplicate artists
                const allArtists = [...artists1, ...artists2];
                this.trendingArtists = allArtists
                  .filter(
                    (artist, index, self) =>
                      index === self.findIndex((a) => a.id === artist.id)
                  )
                  .slice(0, 8);
                this.loading.artists = false;
              },
              error: (err) => {
                console.error('Error loading additional artists', err);
                this.trendingArtists = artists1.slice(0, 8);
                this.loading.artists = false;
              },
            });
        },
        error: (err) => {
          console.error('Error loading trending artists', err);
          this.trendingArtists = [];
          this.loading.artists = false;
        },
      });
  }

  loadRecommendations(): void {
    this.loading.recommendations = true;

    // Use Spotify's recommendations API with popular genres
    this.spotifyService
      .getRecommendations(
        undefined, // no seed tracks
        undefined, // no seed artists
        ['pop', 'rock', 'hip-hop', 'electronic'], // seed genres
        6
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.recommendations = response.tracks || [];
          this.loading.recommendations = false;
          this.recommendationsLoaded = true;
        },
        error: (err) => {
          console.error('Error loading recommendations', err);
          // Fallback to search if recommendations fail
          this.loadRecommendationsFallback();
        },
      });
  }

  private loadRecommendationsFallback(): void {
    // Fallback to search-based recommendations
    this.spotifyService
      .search({ query: 'trending', type: 'track', limit: 6 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.recommendations = response.tracks?.items || [];
          this.loading.recommendations = false;
          this.recommendationsLoaded = true;
        },
        error: (err) => {
          console.error('Error loading recommendations fallback', err);
          this.recommendations = [];
          this.loading.recommendations = false;
          this.recommendationsLoaded = true;
        },
      });
  }

  refreshRecommendations(): void {
    this.loadRecommendations();
  }

  private loadCategories(): void {
    // Load music categories for discovery
    this.spotifyService
      .getCategories(8, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.categories = response.categories?.items || [];
          this.loading.categories = false;
        },
        error: (err) => {
          console.error('Error loading categories', err);
          this.categories = [];
          this.loading.categories = false;
        },
      });
  }

  playTrack(track: any): void {
    this.spotifyService.playTrack(track);
  }

  playAlbumPreview(album: any): void {
    this.playingAlbumId = album.id;

    // Get the first track from the album and play it
    this.spotifyService
      .getAlbumTracks(album.id, 1, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const tracks = response.items || [];
          if (tracks.length > 0) {
            // Create a track object with album info
            const track = {
              ...tracks[0],
              album: {
                ...album,
                images: album.images,
              },
            };
            this.spotifyService.playTrack(track);
          } else {
            console.log('No tracks available for this album');
          }
          this.playingAlbumId = null;
        },
        error: (err) => {
          console.error('Error loading album tracks', err);
          this.playingAlbumId = null;
        },
      });
  }

  getImageUrl(images: any[]): string {
    return images && images.length > 0
      ? images[0].url
      : 'assets/placeholder-album.png';
  }

  formatDuration(ms: number): string {
    if (!ms || isNaN(ms)) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  formatNumber(num: number): string {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Navigation methods
  viewAllAlbums(): void {
    // Navigate to search with album filter for new releases
    this.router.navigate(['/search'], {
      queryParams: { q: 'new album 2024', type: 'album' },
    });
  }

  viewAllArtists(): void {
    // Navigate to search with artist filter for trending artists
    this.router.navigate(['/search'], {
      queryParams: { q: 'popular artists', type: 'artist' },
    });
  }

  viewAllCategories(): void {
    // Navigate to search with categories
    this.router.navigate(['/search'], {
      queryParams: { q: 'music genres', type: 'playlist' },
    });
  }

  viewAllRecommendations(): void {
    // Navigate to search with trending tracks
    this.router.navigate(['/search'], {
      queryParams: { q: 'trending music', type: 'track' },
    });
  }

  viewAlbum(album: any): void {
    // Navigate to album details
    this.router.navigate(['/album', album.id]);
  }

  viewArtist(artist: any): void {
    // Navigate to artist details
    this.router.navigate(['/artist', artist.id]);
  }

  viewCategory(category: any): void {
    // Navigate to category playlists
    this.router.navigate(['/search'], {
      queryParams: { q: category.name, type: 'playlist' },
    });
  }

  isAlbumPlaying(albumId: string): boolean {
    return this.playingAlbumId === albumId;
  }
}
