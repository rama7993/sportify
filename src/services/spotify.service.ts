import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Buffer } from 'buffer';
import { environment } from '../environments/environment';

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

  // Audio player state
  private currentTrackSubject = new BehaviorSubject<Track | null>(null);
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private currentTimeSubject = new BehaviorSubject<number>(0);
  private durationSubject = new BehaviorSubject<number>(0);

  public currentTrack$ = this.currentTrackSubject.asObservable();
  public isPlaying$ = this.isPlayingSubject.asObservable();
  public currentTime$ = this.currentTimeSubject.asObservable();
  public duration$ = this.durationSubject.asObservable();

  constructor(private http: HttpClient) {}

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

  // Get artist's top tracks
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

  // Get related artists
  getRelatedArtists(artistId: string): Observable<any> {
    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(
          `${this.apiUrl}/artists/${artistId}/related-artists`,
          {
            headers: this.setAuthHeader(),
          }
        )
      )
    );
  }

  // Get album tracks
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

  // Get featured playlists
  getFeaturedPlaylists(
    limit: number = 20,
    offset: number = 0
  ): Observable<any> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString())
      .set('market', 'IN');

    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/browse/featured-playlists`, {
          headers: this.setAuthHeader(),
          params,
        })
      )
    );
  }

  // Get new releases
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

  // Get categories
  getCategories(limit: number = 20, offset: number = 0): Observable<any> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString())
      .set('market', 'IN');

    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/browse/categories`, {
          headers: this.setAuthHeader(),
          params,
        })
      )
    );
  }

  // Get category playlists
  getCategoryPlaylists(
    categoryId: string,
    limit: number = 20,
    offset: number = 0
  ): Observable<any> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString())
      .set('market', 'IN');

    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(
          `${this.apiUrl}/browse/categories/${categoryId}/playlists`,
          {
            headers: this.setAuthHeader(),
            params,
          }
        )
      )
    );
  }

  // Get recommendations
  getRecommendations(
    seedTracks?: string[],
    seedArtists?: string[],
    seedGenres?: string[],
    limit: number = 20
  ): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('market', 'IN');

    if (seedTracks && seedTracks.length > 0) {
      params = params.set('seed_tracks', seedTracks.join(','));
    }
    if (seedArtists && seedArtists.length > 0) {
      params = params.set('seed_artists', seedArtists.join(','));
    }
    if (seedGenres && seedGenres.length > 0) {
      params = params.set('seed_genres', seedGenres.join(','));
    }

    return this.ensureAccessToken().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiUrl}/recommendations`, {
          headers: this.setAuthHeader(),
          params,
        })
      )
    );
  }

  // Audio player methods
  playTrack(track: Track): void {
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
}
