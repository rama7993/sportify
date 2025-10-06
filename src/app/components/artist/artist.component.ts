import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpotifyService, Track } from '../../../services/spotify.service';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-artist',
  standalone: true,
  imports: [CommonModule, RouterLink, BreadcrumbComponent],
  templateUrl: './artist.component.html',
  styleUrl: './artist.component.scss',
})
export class ArtistComponent implements OnInit, OnDestroy {
  id!: string;
  artist: any = null;
  topTracks: Track[] = [];
  albums: any[] = [];
  relatedArtists: any[] = [];
  breadcrumbs: BreadcrumbItem[] = [];

  loading = {
    artist: true,
    topTracks: true,
    albums: true,
    relatedArtists: true,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService
  ) {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      if (this.id) {
        this.loadArtistData();
      }
    });
  }

  ngOnInit(): void {
    // Data loading is handled in constructor when route params change
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadArtistData(): void {
    this.loadArtist();
    this.loadTopTracks();
    this.loadAlbums();
    this.loadRelatedArtists();
  }

  private loadArtist(): void {
    this.spotifyService
      .getArtists(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.artist = response.artists[0];
          this.loading.artist = false;
          this.setBreadcrumbs();
        },
        error: (err) => {
          console.error('Error loading artist', err);
          this.loading.artist = false;
        },
      });
  }

  private loadTopTracks(): void {
    this.spotifyService
      .getArtistTopTracks(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (response) => {
          this.topTracks = response.tracks || [];
          this.loading.topTracks = false;
        },
        error: (err) => {
          console.error('Error loading top tracks', err);
          this.loading.topTracks = false;
        },
      });
  }

  private loadAlbums(): void {
    this.spotifyService
      .getArtistAlbums(this.id, 12, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.albums = response.items || [];
          this.loading.albums = false;
        },
        error: (err) => {
          console.error('Error loading albums', err);
          this.loading.albums = false;
        },
      });
  }

  private loadRelatedArtists(): void {
    this.spotifyService
      .getRelatedArtists(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.relatedArtists = Array.isArray(response)
            ? response
            : response.artists || [];
          this.loading.relatedArtists = false;
        },
        error: (err) => {
          console.error('Error loading related artists', err);
          this.loading.relatedArtists = false;
        },
      });
  }

  playTrack(track: Track): void {
    this.spotifyService.playTrack(track);
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getImageUrl(images: any[]): string {
    return images && images.length > 0
      ? images[0].url
      : 'assets/placeholder-album.png';
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

  private setBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: 'Home', route: ['/'], icon: 'fas fa-home' },
      { label: 'Artists', route: ['/search'], icon: 'fas fa-users' },
      { label: this.artist?.name || 'Artist', icon: 'fas fa-music' },
    ];
  }
}
