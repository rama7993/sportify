import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface PreviewRequest {
  trackName: string;
  artistName?: string;
}

export interface PreviewResponse {
  success: boolean;
  previewUrl: string | null;
  track?: {
    name: string;
    artist: string;
    spotifyUrl: string;
    albumName: string;
    releaseDate: string;
    popularity: number;
    durationMs: number;
  };
  message?: string;
  searchQuery?: string;
}

export interface BackendHealthResponse {
  success: boolean;
  message: string;
  spotifyPreviewFinder: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private apiUrl = environment.backendApiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get preview URL for a track using the backend API
   */
  getPreviewUrl(request: PreviewRequest): Observable<PreviewResponse> {
    return this.http.post<PreviewResponse>(`${this.apiUrl}/preview`, request);
  }

  /**
   * Test backend connectivity and Spotify Preview Finder
   */
  testBackend(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test`);
  }

  /**
   * Check backend health
   */
  checkHealth(): Observable<BackendHealthResponse> {
    return this.http.get<BackendHealthResponse>(`${this.apiUrl}/health`);
  }

  /**
   * Check if backend is available
   */
  isBackendAvailable(): Observable<boolean> {
    return new Observable((observer) => {
      this.checkHealth().subscribe({
        next: (response) => {
          observer.next(
            response.success && response.spotifyPreviewFinder === 'initialized'
          );
          observer.complete();
        },
        error: () => {
          observer.next(false);
          observer.complete();
        },
      });
    });
  }
}
