import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpotifyService, Track } from '../../../services/spotify.service';
import { TrackPlayingService } from '../../services/track-playing.service';
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

  private destroy$ = new Subject<void>();

  constructor(
    private spotifyService: SpotifyService,
    private trackPlayingService: TrackPlayingService,
    private route: ActivatedRoute,
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

  async playTrack(): Promise<void> {
    if (this.track) {
      await this.trackPlayingService.playTrack(this.track);
    }
  }

  formatDuration(ms: number): string {
    return this.trackPlayingService.formatDuration(ms);
  }

  getImageUrl(images: any[]): string {
    return this.trackPlayingService.getImageUrl(images);
  }

  getArtistNames(artists: any[]): string {
    return this.trackPlayingService.getArtistNames(artists);
  }

  formatNumber(num: number): string {
    return this.trackPlayingService.formatNumber(num);
  }

  hasPreviewUrl(): boolean {
    return this.track
      ? this.trackPlayingService.hasPreviewUrl(this.track)
      : false;
  }

  openInSpotify(): void {
    if (this.track) {
      this.trackPlayingService.openInSpotify(this.track);
    }
  }

  isTrackPlaying(): boolean {
    return this.track
      ? this.trackPlayingService.isTrackPlaying(this.track.id)
      : false;
  }

  isTrackSearchingPreview(): boolean {
    return this.track
      ? this.trackPlayingService.isTrackSearchingPreview(this.track.id)
      : false;
  }

  // Audio event handlers removed - now handled by TrackPlayingService

  private setBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: 'Home', route: ['/'], icon: 'fas fa-home' },
      { label: 'Tracks', route: ['/search'], icon: 'fas fa-music' },
      { label: this.track?.name || 'Track', icon: 'fas fa-play' },
    ];
  }
}
