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
  selector: 'app-playlist',
  standalone: true,
  imports: [RouterLink, CommonModule, BreadcrumbComponent],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss',
})
export class PlaylistComponent implements OnInit, OnDestroy {
  id!: string;
  playlist: any = null;
  tracks: Track[] = [];
  breadcrumbs: BreadcrumbItem[] = [];
  showFullDescription = false;

  loading = {
    playlist: true,
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
        this.loadPlaylistData();
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

  private loadPlaylistData(): void {
    this.loadPlaylist();
    this.loadPlaylistTracks();
  }

  private loadPlaylist(): void {
    this.loading.playlist = true;
    this.spotifyService
      .getPlaylist(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (playlist) => {
          this.playlist = playlist;
          this.loading.playlist = false;
          this.setBreadcrumbs();
        },
        error: (error) => {
          console.error('Error loading playlist:', error);
          this.loading.playlist = false;
        },
      });
  }

  private loadPlaylistTracks(): void {
    this.loading.tracks = true;
    this.spotifyService
      .getPlaylistTracks(this.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (response) => {
          this.tracks = response.items
            .map((item: any) => item.track)
            .filter((track: any) => track !== null);
          this.loading.tracks = false;
        },
        error: (error) => {
          console.error('Error loading playlist tracks:', error);
          this.loading.tracks = false;
        },
      });
  }

  async playTrack(track: Track): Promise<void> {
    await this.trackPlayingService.playTrack(track, {
      playlist: this.playlist,
    });
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

  isTrackPlaying(trackId: string): boolean {
    return this.trackPlayingService.isTrackPlaying(trackId);
  }

  isTrackSearchingPreview(trackId: string): boolean {
    return this.trackPlayingService.isTrackSearchingPreview(trackId);
  }

  hasPreviewUrl(track: Track): boolean {
    return this.trackPlayingService.hasPreviewUrl(track);
  }

  openInSpotify(track: Track): void {
    this.trackPlayingService.openInSpotify(track);
  }

  decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  toggleDescription(): void {
    this.showFullDescription = !this.showFullDescription;
  }

  getTruncatedDescription(
    description: string,
    maxLength: number = 200
  ): string {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  shouldShowReadMore(description: string, maxLength: number = 200): boolean {
    return !!(description && description.length > maxLength);
  }

  private setBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: 'Home', route: ['/'], icon: 'fas fa-home' },
      { label: 'Playlists', route: ['/search'], icon: 'fas fa-list' },
      { label: this.playlist?.name || 'Playlist', icon: 'fas fa-music' },
    ];
  }
}
