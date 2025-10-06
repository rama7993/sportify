import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Buffer } from 'buffer';
import { environment } from '../environments/environment';
import { BackendService, PreviewRequest } from './backend.service';

export interface SearchOptions {
  query: string;
  type?: string;
  limit?: number;
  offset?: number;
  market?: string;
}

export interface Track {
  id: string;
  name: string;
  artists: any[];
  album: any;
  preview_url: string | null;
  duration_ms: number;
  popularity: number;
  external_urls: any;
}

export interface SearchResponse {
  tracks?: {
    items: Track[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
    previous: string | null;
  };
  playlists?: {
    items: any[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
    previous: string | null;
  };
  albums?: {
    items: any[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
    previous: string | null;
  };
  artists?: {
    items: any[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
    previous: string | null;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private apiUrl = 'https://api.spotify.com/v1';
  private clientId = environment.spotify.clientId;
  private clientSecret = environment.spotify.clientSecret;
  private accessToken!: string;
  private previewCache = new Map<string, string | null>();

  // Audio player state
  private currentTrackSubject = new BehaviorSubject<Track | null>(null);
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private currentTimeSubject = new BehaviorSubject<number>(0);
  private durationSubject = new BehaviorSubject<number>(0);

  public currentTrack$ = this.currentTrackSubject.asObservable();
  public isPlaying$ = this.isPlayingSubject.asObservable();
  public currentTime$ = this.currentTimeSubject.asObservable();
  public duration$ = this.durationSubject.asObservable();

  constructor(
    private http: HttpClient,
    private backendService: BackendService
  ) {}

  // ========================================
  // AUTHENTICATION
  // ========================================

  private getAccessToken(): Observable<string> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set(
        'Authorization',
        'Basic ' +
          Buffer.from(this.clientId + ':' + this.clientSecret).toString(
            'base64'
          )
      );

    const body = new HttpParams().set('grant_type', 'client_credentials');

    return this.http
      .post<any>('https://accounts.spotify.com/api/token', body.toString(), {
        headers,
      })
      .pipe(
        map((response) => {
          if (response.access_token) {
            this.accessToken = response.access_token;
            return this.accessToken;
          } else {
            throw new Error('No access token in response');
          }
        }),
        catchError((error) => {
          console.error('Error fetching access token', error);
          throw error;
        })
      );
  }

  private ensureAccessToken(): Observable<string> {
    if (this.accessToken) {
      return of(this.accessToken);
    } else {
      return this.getAccessToken();
    }
  }

  private setAuthHeader(): HttpHeaders {
    if (!this.accessToken) {
      throw new Error('Access token is not set');
    }
    return new HttpHeaders().set('Authorization', 'Bearer ' + this.accessToken);
  }

  // ========================================
  // SEARCH API
  // ========================================

  search(options: SearchOptions): Observable<SearchResponse> {
    const params = new HttpParams()
      .set('q', options.query)
      .set('type', options.type || 'track')
      .set('limit', (options.limit || 20).toString())
      .set('offset', (options.offset || 0).toString())
      .set('market', options.market || 'IN');

    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<SearchResponse>(`${this.apiUrl}/search`, {
          headers: this.setAuthHeader(),
          params,
        })
      )
    );
  }

  searchAll(
    query: string,
    limit: number = 20,
    offset: number = 0
  ): Observable<any> {
    const params = new HttpParams()
      .set('q', query)
      .set('type', 'track,artist,album,playlist')
      .set('limit', limit.toString())
      .set('offset', offset.toString())
      .set('market', 'IN');

    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/search`, {
          headers: this.setAuthHeader(),
          params,
        })
      )
    );
  }

  // ========================================
  // CATEGORIES API
  // ========================================

  getCategories(
    limit: number = 20,
    offset: number = 0,
    locale: string = 'en_IN'
  ): Observable<any> {
    const params = new HttpParams()
      .set('locale', locale)
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/browse/categories`, {
          headers: this.setAuthHeader(),
          params,
        })
      )
    );
  }

  getCategory(categoryId: string, locale: string = 'en_IN'): Observable<any> {
    const params = new HttpParams().set('locale', locale);

    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/browse/categories/${categoryId}`, {
          headers: this.setAuthHeader(),
          params,
        })
      )
    );
  }

  // Get playlists by category using search API (replacement for deprecated category playlists)
  getPlaylistsByCategory(
    categoryId: string,
    limit: number = 20,
    offset: number = 0
  ): Observable<any> {
    const searchTerms = this.getCategorySearchTerms(categoryId);

    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.search({
          query: searchTerms,
          type: 'playlist',
          limit: limit,
          offset: offset,
        })
      )
    );
  }

  private getCategorySearchTerms(categoryId: string): string {
    const categoryMappings: { [key: string]: string } = {
      pop: 'pop music',
      rock: 'rock music',
      'hip-hop': 'hip hop rap',
      jazz: 'jazz music',
      classical: 'classical music',
      electronic: 'electronic dance music',
      country: 'country music',
      'r-b': 'r&b soul',
      blues: 'blues music',
      folk: 'folk music',
      reggae: 'reggae music',
      funk: 'funk music',
      soul: 'soul music',
      disco: 'disco music',
      punk: 'punk rock',
      indie: 'indie alternative',
      alternative: 'alternative rock',
      metal: 'heavy metal',
      gospel: 'gospel music',
      latin: 'latin music',
      world: 'world music',
      'new-age': 'new age music',
      ambient: 'ambient music',
      trance: 'trance music',
      house: 'house music',
      techno: 'techno music',
      dubstep: 'dubstep music',
      'drum-and-bass': 'drum and bass',
      trap: 'trap music',
      'lo-fi': 'lo-fi hip hop',
      chill: 'chill music',
      focus: 'focus study music',
      workout: 'workout fitness music',
      party: 'party music',
      romance: 'romantic music',
      sleep: 'sleep relaxation music',
      travel: 'travel music',
      kids: 'kids children music',
      comedy: 'comedy music',
      soundtrack: 'movie soundtrack',
      holiday: 'holiday christmas music',
      dinner: 'dinner music',
      equal: 'equal music',
      mood: 'mood music',
      decades: 'decades music',
      instrumental: 'instrumental music',
      acoustic: 'acoustic music',
      live: 'live music',
      cover: 'cover songs',
      remix: 'remix music',
      telugu: 'telugu music',
      tamil: 'tamil music',
      hindi: 'hindi music',
      malayalam: 'malayalam music',
      kannada: 'kannada music',
    };

    const lowerCategoryId = categoryId.toLowerCase();
    return categoryMappings[lowerCategoryId] || categoryId.replace(/-/g, ' ');
  }

  // ========================================
  // TRACKS API
  // ========================================

  getTracks(ids: string): Observable<any> {
    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/tracks`, {
          headers: this.setAuthHeader(),
          params: new HttpParams().set('ids', ids),
        })
      )
    );
  }

  // ========================================
  // ARTISTS API
  // ========================================

  getArtists(ids: string): Observable<any> {
    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/artists`, {
          headers: this.setAuthHeader(),
          params: new HttpParams().set('ids', ids),
        })
      )
    );
  }

  getArtistAlbums(
    artistId: string,
    limit: number = 20,
    offset: number = 0
  ): Observable<any> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString())
      .set('market', 'IN');

    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/artists/${artistId}/albums`, {
          headers: this.setAuthHeader(),
          params,
        })
      )
    );
  }

  getArtistTopTracks(artistId: string, market: string = 'IN'): Observable<any> {
    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/artists/${artistId}/top-tracks`, {
          headers: this.setAuthHeader(),
          params: new HttpParams().set('market', market),
        })
      )
    );
  }

  // ========================================
  // ALBUMS API
  // ========================================

  getAlbums(ids: string): Observable<any> {
    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/albums`, {
          headers: this.setAuthHeader(),
          params: new HttpParams().set('ids', ids),
        })
      )
    );
  }

  getAlbumTracks(
    albumId: string,
    limit: number = 20,
    offset: number = 0
  ): Observable<any> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString())
      .set('market', 'IN');

    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/albums/${albumId}/tracks`, {
          headers: this.setAuthHeader(),
          params,
        })
      )
    );
  }

  getNewReleases(limit: number = 20, offset: number = 0): Observable<any> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString())
      .set('market', 'IN');

    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/browse/new-releases`, {
          headers: this.setAuthHeader(),
          params,
        })
      )
    );
  }

  // ========================================
  // PLAYLISTS API
  // ========================================

  getPlaylist(playlistId: string): Observable<any> {
    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/playlists/${playlistId}`, {
          headers: this.setAuthHeader(),
        })
      )
    );
  }

  getPlaylistTracks(
    playlistId: string,
    limit: number = 20,
    offset: number = 0
  ): Observable<any> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString())
      .set('market', 'IN');

    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/playlists/${playlistId}/tracks`, {
          headers: this.setAuthHeader(),
          params,
        })
      )
    );
  }

  // ========================================
  // AUDIO PLAYER METHODS
  // ========================================

  playTrack(track: Track): void {
    this.currentTrackSubject.next(track);
    this.isPlayingSubject.next(true);
  }

  playTrackDirectly(track: Track): void {
    // Play track directly without any preview fetching logic
    this.currentTrackSubject.next(track);
    this.isPlayingSubject.next(true);
  }

  pauseTrack(): void {
    this.isPlayingSubject.next(false);
  }

  resumeTrack(): void {
    this.isPlayingSubject.next(true);
  }

  stopTrack(): void {
    this.isPlayingSubject.next(false);
    this.currentTimeSubject.next(0);
  }

  updateCurrentTime(time: number): void {
    this.currentTimeSubject.next(time);
  }

  updateDuration(duration: number): void {
    this.durationSubject.next(duration);
  }

  // ========================================
  // PREVIEW URL UTILITIES
  // ========================================

  // Method to check if a track has a working preview URL
  hasPreviewUrl(track: any): boolean {
    return !!(track && track.preview_url && track.preview_url.trim() !== '');
  }

  // Method to get a user-friendly message for tracks without previews
  getPreviewStatusMessage(track: any): string {
    if (this.hasPreviewUrl(track)) {
      return 'Preview available';
    }
    return 'No preview available';
  }

  // Method to get Spotify URL for a track
  getSpotifyUrl(track: any): string | null {
    return track?.external_urls?.spotify || null;
  }

  // Method to open track in Spotify
  openInSpotify(track: any): void {
    const spotifyUrl = this.getSpotifyUrl(track);
    if (spotifyUrl) {
      window.open(spotifyUrl, '_blank');
    } else {
      console.warn('No Spotify URL available for this track');
    }
  }

  // ========================================
  // BACKEND INTEGRATION
  // ========================================

  /**
   * Find preview URL using backend API
   */
  private async findPreviewWithBackend(
    trackName: string,
    artistName?: string
  ): Promise<string | null> {
    // Create cache key
    const cacheKey = `${trackName}|${artistName || 'unknown'}`;

    // Check cache first
    if (this.previewCache.has(cacheKey)) {
      // console.log('🎵 Using cached preview URL for:', trackName);
      return this.previewCache.get(cacheKey) || null;
    }

    try {
      //console.log('🔍 Fetching preview URL for:', trackName);
      const request: PreviewRequest = { trackName, artistName };
      const response = await this.backendService
        .getPreviewUrl(request)
        .toPromise();

      let previewUrl: string | null = null;
      if (response?.success && response.previewUrl) {
        previewUrl = response.previewUrl;
        //console.log('✅ Found preview URL for:', trackName);
      } else {
        //console.log('❌ No preview URL found for:', trackName);
      }

      // Cache the result (even if null)
      this.previewCache.set(cacheKey, previewUrl);
      return previewUrl;
    } catch (error) {
      console.warn('Backend preview search failed:', error);
      // Cache the failure
      this.previewCache.set(cacheKey, null);
      return null;
    }
  }

  /**
   * Enhanced track object with preview URL using backend
   */
  async enhanceTrackWithPreview(track: any): Promise<any> {
    if (track.preview_url) {
      return track;
    }

    const artistName = track.artists?.[0]?.name;
    const previewUrl = await this.findPreviewWithBackend(
      track.name,
      artistName
    );

    return {
      ...track,
      preview_url: previewUrl,
    };
  }

  /**
   * Clear preview cache (useful for testing or memory management)
   */
  clearPreviewCache(): void {
    this.previewCache.clear();
    // console.log('🧹 Preview cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.previewCache.size,
      keys: Array.from(this.previewCache.keys()),
    };
  }

  /**
   * Check if backend is available
   */
  isBackendAvailable(): Observable<boolean> {
    return this.backendService.isBackendAvailable();
  }
}
