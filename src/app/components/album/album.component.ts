import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpotifyService, Track } from '../../../services/spotify.service';
import { TrackPlayingService } from '../../../services/track-playing.service';
import { Subject, takeUntil } from 'rxjs';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-album',
  standalone: true,
  imports: [RouterLink, CommonModule, BreadcrumbComponent],
  templateUrl: './album.component.html',
  styleUrl: './album.component.scss',
})
export class AlbumComponent implements OnInit, OnDestroy {
  id!: string;
  album: any = null;
  tracks: Track[] = [];
  breadcrumbs: BreadcrumbItem[] = [];

  loading = {
    album: true,
    tracks: true,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private trackPlayingService: TrackPlayingService
  ) {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      if (this.id) {
        this.loadAlbumData();
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

  private loadAlbumData(): void {
    this.loadAlbum();
    this.loadTracks();
  }

  private loadAlbum(): void {
    this.spotifyService
      .getAlbums(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.album = response.albums[0];
          this.loading.album = false;
          this.setBreadcrumbs();
        },
        error: (err) => {
          console.error('Error loading album', err);
          this.loading.album = false;
        },
      });
  }

  private loadTracks(): void {
    this.spotifyService
      .getAlbumTracks(this.id, 50, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (response) => {
          this.tracks = response.items || [];
          this.loading.tracks = false;
        },
        error: (err) => {
          console.error('Error loading tracks', err);
          this.loading.tracks = false;
        },
      });
  }

  async playTrack(track: Track): Promise<void> {
    await this.trackPlayingService.playTrack(track, { album: this.album });
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

  openInSpotify(track: Track): void {
    this.trackPlayingService.openInSpotify(track);
  }

  formatNumber(num: number): string {
    return this.trackPlayingService.formatNumber(num);
  }

  isTrackPlaying(trackId: string): boolean {
    return this.trackPlayingService.isTrackPlaying(trackId);
  }

  isTrackSearchingPreview(trackId: string): boolean {
    return this.trackPlayingService.isTrackSearchingPreview(trackId);
  }

  hasPreviewUrl(track: Track): boolean {
    return this.trackPlayingService.hasPreviewUrl(track);
  }

  private setBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: 'Home', route: ['/'], icon: 'fas fa-home' },
      { label: 'Albums', route: ['/search'], icon: 'fas fa-compact-disc' },
      { label: this.album?.name || 'Album', icon: 'fas fa-music' },
    ];
  }
}
