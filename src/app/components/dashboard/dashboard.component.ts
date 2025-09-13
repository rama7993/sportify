import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  featuredPlaylists: any[] = [];
  newReleases: any[] = [];
  categories: any[] = [];
  recommendations: any[] = [];
  loading = {
    featured: true,
    newReleases: true,
    categories: true,
    recommendations: true
  };
  
  private destroy$ = new Subject<void>();

  constructor(private spotifyService: SpotifyService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loadFeaturedPlaylists();
    this.loadNewReleases();
    this.loadCategories();
    this.loadRecommendations();
  }

  private loadFeaturedPlaylists(): void {
    this.spotifyService.getFeaturedPlaylists(12, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.featuredPlaylists = response.playlists?.items || [];
          this.loading.featured = false;
        },
        error: (err) => {
          console.error('Error loading featured playlists', err);
          this.loadMockPlaylists();
          this.loading.featured = false;
        }
      });
  }

  private loadMockPlaylists(): void {
    this.featuredPlaylists = [
      {
        id: '1',
        name: 'Today\'s Top Hits',
        description: 'The most played songs right now',
        images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Top+Hits' }],
        tracks: { total: 50 }
      },
      {
        id: '2',
        name: 'Discover Weekly',
        description: 'Your weekly mixtape of fresh music',
        images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Discover' }],
        tracks: { total: 30 }
      },
      {
        id: '3',
        name: 'Chill Hits',
        description: 'Kick back to the best new and recent chill hits',
        images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Chill' }],
        tracks: { total: 40 }
      }
    ];
  }

  private loadNewReleases(): void {
    this.spotifyService.getNewReleases(12, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.newReleases = response.albums?.items || [];
          this.loading.newReleases = false;
        },
        error: (err) => {
          console.error('Error loading new releases', err);
          this.loadMockAlbums();
          this.loading.newReleases = false;
        }
      });
  }

  private loadMockAlbums(): void {
    this.newReleases = [
      {
        id: '1',
        name: 'Future Nostalgia',
        artists: [{ name: 'Dua Lipa' }],
        release_date: '2020-03-27',
        images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Future+Nostalgia' }],
        album_type: 'album'
      },
      {
        id: '2',
        name: 'After Hours',
        artists: [{ name: 'The Weeknd' }],
        release_date: '2020-03-20',
        images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=After+Hours' }],
        album_type: 'album'
      },
      {
        id: '3',
        name: 'Fine Line',
        artists: [{ name: 'Harry Styles' }],
        release_date: '2019-12-13',
        images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Fine+Line' }],
        album_type: 'album'
      }
    ];
  }

  private loadCategories(): void {
    this.spotifyService.getCategories(12, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.categories = response.categories?.items || [];
          this.loading.categories = false;
        },
        error: (err) => {
          console.error('Error loading categories', err);
          this.loadMockCategories();
          this.loading.categories = false;
        }
      });
  }

  private loadMockCategories(): void {
    this.categories = [
      {
        id: 'pop',
        name: 'Pop',
        icons: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Pop' }]
      },
      {
        id: 'rock',
        name: 'Rock',
        icons: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Rock' }]
      },
      {
        id: 'electronic',
        name: 'Electronic',
        icons: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Electronic' }]
      },
      {
        id: 'hip-hop',
        name: 'Hip-Hop',
        icons: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Hip-Hop' }]
      }
    ];
  }

  loadRecommendations(): void {
    // First get some popular tracks to use as seeds for recommendations
    this.spotifyService.search({
      query: 'popular music',
      type: 'track',
      limit: 5,
      offset: 0
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (searchResponse) => {
          const seedTracks = searchResponse.tracks?.items?.slice(0, 5).map((track: any) => track.id) || [];
          
          if (seedTracks.length > 0) {
            // Use the popular tracks as seeds for recommendations
            this.spotifyService.getRecommendations(seedTracks, [], ['pop', 'rock'], 12)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (response) => {
                  this.recommendations = response.tracks || [];
                  this.loading.recommendations = false;
                },
                error: (err) => {
                  console.error('Error loading recommendations', err);
                  this.loadMockRecommendations();
                  this.loading.recommendations = false;
                }
              });
          } else {
            // Fallback to mock recommendations
            this.loadMockRecommendations();
            this.loading.recommendations = false;
          }
        },
        error: (err) => {
          console.error('Error loading seed tracks for recommendations', err);
          this.loadMockRecommendations();
          this.loading.recommendations = false;
        }
      });
  }

  private loadMockRecommendations(): void {
    // Mock recommendations as fallback
    this.recommendations = [
      {
        id: '1',
        name: 'Blinding Lights',
        artists: [{ id: '1', name: 'The Weeknd' }],
        album: { 
          id: '1', 
          name: 'After Hours', 
          images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=After+Hours' }] 
        },
        duration_ms: 200000,
        popularity: 95,
        preview_url: null
      },
      {
        id: '2',
        name: 'Levitating',
        artists: [{ id: '2', name: 'Dua Lipa' }],
        album: { 
          id: '2', 
          name: 'Future Nostalgia', 
          images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Future+Nostalgia' }] 
        },
        duration_ms: 203000,
        popularity: 90,
        preview_url: null
      },
      {
        id: '3',
        name: 'Watermelon Sugar',
        artists: [{ id: '3', name: 'Harry Styles' }],
        album: { 
          id: '3', 
          name: 'Fine Line', 
          images: [{ url: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Fine+Line' }] 
        },
        duration_ms: 174000,
        popularity: 88,
        preview_url: null
      }
    ];
  }

  playTrack(track: any): void {
    this.spotifyService.playTrack(track);
  }

  getImageUrl(images: any[]): string {
    return images && images.length > 0 ? images[0].url : 'assets/placeholder-album.png';
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
}
