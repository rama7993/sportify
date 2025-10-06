import { Injectable } from '@angular/core';
import { SpotifyService, Track } from '../../services/spotify.service';

export interface TrackPlayingState {
  isPlaying: boolean;
  currentTrackId: string | null;
  isSearchingPreview: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TrackPlayingService {
  private playingStates = new Map<string, TrackPlayingState>();

  constructor(private spotifyService: SpotifyService) {}

  /**
   * Play a track with preview URL enhancement
   */
  async playTrack(
    track: Track,
    contextInfo?: { album?: any; playlist?: any }
  ): Promise<void> {
    if (!track) return;

    // Set loading state
    this.setPlayingState(track.id, {
      isPlaying: false,
      currentTrackId: track.id,
      isSearchingPreview: true,
    });

    try {
      // Enhance track with context information
      const enhancedTrack = this.enhanceTrackWithContext(track, contextInfo);

      // Try to enhance track with preview URL if not available
      if (!enhancedTrack.preview_url) {
        const trackWithPreview =
          await this.spotifyService.enhanceTrackWithPreview(enhancedTrack);
        this.spotifyService.playTrack(trackWithPreview);
        this.setPlayingState(track.id, {
          isPlaying: true,
          currentTrackId: track.id,
          isSearchingPreview: false,
        });
      } else {
        this.spotifyService.playTrack(enhancedTrack);
        this.setPlayingState(track.id, {
          isPlaying: true,
          currentTrackId: track.id,
          isSearchingPreview: false,
        });
      }
    } catch (error) {
      console.error('Error playing track:', error);
      this.setPlayingState(track.id, {
        isPlaying: false,
        currentTrackId: null,
        isSearchingPreview: false,
      });
    }
  }

  /**
   * Check if a track is currently playing
   */
  isTrackPlaying(trackId: string): boolean {
    const state = this.playingStates.get(trackId);
    return state?.isPlaying || false;
  }

  /**
   * Check if a track is currently searching for preview
   */
  isTrackSearchingPreview(trackId: string): boolean {
    const state = this.playingStates.get(trackId);
    return state?.isSearchingPreview || false;
  }

  /**
   * Get the current playing state for a track
   */
  getTrackPlayingState(trackId: string): TrackPlayingState {
    return (
      this.playingStates.get(trackId) || {
        isPlaying: false,
        currentTrackId: null,
        isSearchingPreview: false,
      }
    );
  }

  /**
   * Check if a track has a preview URL
   */
  hasPreviewUrl(track: Track): boolean {
    return this.spotifyService.hasPreviewUrl(track);
  }

  /**
   * Open track in Spotify
   */
  openInSpotify(track: Track): void {
    this.spotifyService.openInSpotify(track);
  }

  /**
   * Get preview status message
   */
  getPreviewStatusMessage(track: Track): string {
    return this.spotifyService.getPreviewStatusMessage(track);
  }

  /**
   * Format duration from milliseconds
   */
  formatDuration(ms: number): string {
    if (!ms || isNaN(ms)) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get image URL from images array
   */
  getImageUrl(images: any[]): string {
    return images && images.length > 0
      ? images[0].url
      : 'assets/placeholder-album.png';
  }

  /**
   * Get artist names as comma-separated string
   */
  getArtistNames(artists: any[]): string {
    if (!artists || !Array.isArray(artists)) {
      return 'Unknown Artist';
    }
    return artists.map((artist) => artist?.name || 'Unknown').join(', ');
  }

  /**
   * Format number with K/M suffixes
   */
  formatNumber(num: number): string {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Private method to enhance track with context information
   */
  private enhanceTrackWithContext(
    track: Track,
    contextInfo?: { album?: any; playlist?: any }
  ): Track {
    if (!contextInfo) return track;

    const enhancedTrack = { ...track };

    if (contextInfo.album) {
      enhancedTrack.album = {
        ...track.album,
        images: contextInfo.album.images || track.album.images,
        name: contextInfo.album.name || track.album.name,
      };
    }

    if (contextInfo.playlist) {
      enhancedTrack.album = {
        ...track.album,
        images: contextInfo.playlist.images || track.album.images,
        name: contextInfo.playlist.name || track.album.name,
      };
    }

    return enhancedTrack;
  }

  /**
   * Private method to set playing state for a track
   */
  private setPlayingState(trackId: string, state: TrackPlayingState): void {
    this.playingStates.set(trackId, state);
  }

  /**
   * Clear playing state for a track
   */
  clearPlayingState(trackId: string): void {
    this.playingStates.delete(trackId);
  }

  /**
   * Clear all playing states
   */
  clearAllPlayingStates(): void {
    this.playingStates.clear();
  }
}
