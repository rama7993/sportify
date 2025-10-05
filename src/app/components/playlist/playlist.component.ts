import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpotifyService, Track } from '../../../services/spotify.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './playlist.component.html',
  styleUrl: './playlist.component.scss',
})
export class PlaylistComponent implements OnInit, OnDestroy {
  id!: string;
  playlist: any = null;
  tracks: Track[] = [];

  loading = {
    playlist: true,
    tracks: true,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService
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
        next: (response) => {
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

  playTrack(track: Track): void {
    this.spotifyService.playTrack(track);
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getImageUrl(images: any[]): string {
    if (images && images.length > 0 && images[0] && images[0].url) {
      return images[0].url;
    }
    return 'assets/placeholder-album.png';
  }

  getArtistNames(artists: any[]): string {
    return artists.map((artist) => artist.name).join(', ');
  }

  decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }
}
