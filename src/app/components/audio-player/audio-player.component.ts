import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotifyService, Track } from '../../../services/spotify.service';
import { TrackPlayingService } from '../../services/track-playing.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.scss',
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('audioElement') audioElement!: ElementRef<HTMLAudioElement>;
  @ViewChild('progressBar') progressBar!: ElementRef<HTMLInputElement>;

  currentTrack: Track | null = null;
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  volume = 0.7;
  isMuted = false;
  isShuffled = false;
  repeatMode: 'none' | 'one' | 'all' = 'none';

  private destroy$ = new Subject<void>();

  constructor(
    private spotifyService: SpotifyService,
    private trackPlayingService: TrackPlayingService,
  ) {}

  ngOnInit(): void {
    this.subscribeToPlayerState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToPlayerState(): void {
    this.spotifyService.currentTrack$
      .pipe(takeUntil(this.destroy$))
      .subscribe((track) => {
        this.currentTrack = track;
        if (track && this.audioElement) {
          this.loadTrack(track);
        }
      });

    this.spotifyService.isPlaying$
      .pipe(takeUntil(this.destroy$))
      .subscribe((playing) => {
        this.isPlaying = playing;
        if (this.audioElement) {
          if (playing) {
            this.audioElement.nativeElement.play();
          } else {
            this.audioElement.nativeElement.pause();
          }
        }
      });
  }

  private loadTrack(track: Track): void {
    if (this.audioElement) {
      if (track.preview_url) {
        this.audioElement.nativeElement.src = track.preview_url;
        this.audioElement.nativeElement.load();
      } else {
        this.audioElement.nativeElement.src = '';
        this.audioElement.nativeElement.load();
      }
    }
  }

  togglePlayPause(): void {
    if (this.isPlaying) {
      this.spotifyService.pauseTrack();
    } else {
      this.spotifyService.resumeTrack();
    }
  }

  previousTrack(): void {
    if (this.audioElement && this.currentTime > 3) {
      this.audioElement.nativeElement.currentTime = 0;
    } else {
      this.trackPlayingService.playPrevious();
    }
  }

  nextTrack(): void {
    this.handleTrackEnd();
  }

  stopTrack(): void {
    this.spotifyService.stopTrack();
    if (this.audioElement) {
      this.audioElement.nativeElement.pause();
      this.audioElement.nativeElement.currentTime = 0;
    }
  }

  onTimeUpdate(): void {
    if (this.audioElement) {
      this.currentTime = this.audioElement.nativeElement.currentTime;
      this.spotifyService.updateCurrentTime(this.currentTime);
    }
  }

  onLoadedMetadata(): void {
    if (this.audioElement) {
      this.duration = this.audioElement.nativeElement.duration;
      this.spotifyService.updateDuration(this.duration);
    }
  }

  onEnded(): void {
    this.handleTrackEnd();
  }

  private handleTrackEnd(): void {
    switch (this.repeatMode) {
      case 'one':
        if (this.audioElement) {
          this.audioElement.nativeElement.currentTime = 0;
          this.audioElement.nativeElement.play();
        }
        break;
      case 'all':
      default:
        this.trackPlayingService.playNext();
        break;
    }
  }

  seekTo(event: MouseEvent): void {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const seekTime = percentage * this.duration;

    if (this.audioElement) {
      this.audioElement.nativeElement.currentTime = seekTime;
      this.currentTime = seekTime;
    }
  }

  setVolume(event: MouseEvent): void {
    const volumeBar = event.currentTarget as HTMLElement;
    const rect = volumeBar.getBoundingClientRect();
    const x = event.clientX - rect.left;
    let newVolume = x / rect.width;

    // Clamp volume between 0 and 1
    newVolume = Math.max(0, Math.min(1, newVolume));

    this.volume = newVolume;

    if (this.audioElement) {
      this.audioElement.nativeElement.volume = this.volume;
    }
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;

    if (this.audioElement) {
      this.audioElement.nativeElement.muted = this.isMuted;
    }
  }

  toggleShuffle(): void {
    this.isShuffled = !this.isShuffled;
  }

  toggleRepeat(): void {
    switch (this.repeatMode) {
      case 'none':
        this.repeatMode = 'all';
        break;
      case 'all':
        this.repeatMode = 'one';
        break;
      case 'one':
        this.repeatMode = 'none';
        break;
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getImageUrl(images: any[]): string {
    return images && images.length > 0 ? images[0].url : '';
  }

  getPlaceholderImage(): string {
    return '';
  }

  getArtistNames(artists: any[]): string {
    if (!artists || !Array.isArray(artists)) {
      return 'Unknown Artist';
    }
    return artists.map((artist) => artist?.name || 'Unknown').join(', ');
  }

  // Expose Math to template
  Math = Math;
}
