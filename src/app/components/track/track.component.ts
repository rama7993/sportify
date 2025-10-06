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
  selector: 'app-track',
  standalone: true,
  imports: [CommonModule, RouterLink, BreadcrumbComponent],
  templateUrl: './track.component.html',
  styleUrl: './track.component.scss',
})
export class TrackComponent implements OnInit, OnDestroy {
  id!: string;
  track: Track | null = null;
  loading: boolean = true;
  breadcrumbs: BreadcrumbItem[] = [];
  isPlaying: boolean = false;
  isSearchingPreview: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private spotifyService: SpotifyService,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      if (this.id) {
        this.loadTrack();
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

  private loadTrack(): void {
    this.spotifyService
      .getTracks(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.track = response.tracks[0];
          this.loading = false;
          this.setBreadcrumbs();
        },
        error: (err) => {
          console.error('Error loading track', err);
          this.loading = false;
        },
      });
  }

  playTrack(): void {
    if (this.track) {
      this.spotifyService.playTrack(this.track);
    }
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

  getArtistNames(artists: any[]): string {
    return artists.map((artist) => artist.name).join(', ');
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  hasPreviewUrl(): boolean {
    return this.spotifyService.hasPreviewUrl(this.track);
  }

  openInSpotify(): void {
    this.spotifyService.openInSpotify(this.track);
  }

  async tryFindPreview(): Promise<void> {
    if (!this.track) return;

    this.isSearchingPreview = true;
    try {
      console.log(
        `🔍 Searching for preview: "${this.track.name}" by "${
          this.track.artists?.[0]?.name || 'Unknown Artist'
        }"`
      );

      // Use backend service to find preview
      const enhancedTrack = await this.spotifyService.enhanceTrackWithPreview(
        this.track
      );
      if (enhancedTrack.preview_url) {
        this.track = enhancedTrack;
        console.log('✅ Preview found and loaded!', enhancedTrack.preview_url);
      } else {
        console.log('❌ No preview found for this track');
      }
    } catch (error) {
      console.error('❌ Error searching for preview:', error);
    } finally {
      this.isSearchingPreview = false;
    }
  }

  onAudioLoaded(): void {
    console.log('Audio loaded successfully');
  }

  onTimeUpdate(): void {
    // Handle time update if needed
  }

  onAudioEnded(): void {
    this.isPlaying = false;
  }

  async testBackend(): Promise<void> {
    await this.spotifyService.testBackend();
  }

  private setBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: 'Home', route: ['/'], icon: 'fas fa-home' },
      { label: 'Tracks', route: ['/search'], icon: 'fas fa-music' },
      { label: this.track?.name || 'Track', icon: 'fas fa-play' },
    ];
  }
}
