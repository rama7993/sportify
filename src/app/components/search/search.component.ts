import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpotifyService, Track } from '../../../services/spotify.service';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [HttpClientModule, FormsModule, RouterLink, CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit, OnDestroy {
  query: string = 'devara';
  searchType: string = 'all';
  tracks: Track[] = [];
  artists: any[] = [];
  albums: any[] = [];
  playlists: any[] = [];
  loading: boolean = false;
  hasMore: boolean = true;
  currentOffset: number = 0;
  totalResults: number = 0;
  loadedResults: number = 0;
  loadingState: 'idle' | 'searching' | 'loading-more' = 'idle';
  searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private spotifyService: SpotifyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();

    // Check for query parameters
    this.route.queryParams.subscribe((params) => {
      if (params['q']) {
        this.query = params['q'];
      }
      if (params['type']) {
        this.searchType = params['type'];
      }
      this.search();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetSearch();
        this.search();
      });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.query);
  }

  onSearchTypeChange(): void {
    this.resetSearch();
    this.search();
  }

  resetSearch(): void {
    this.tracks = [];
    this.artists = [];
    this.albums = [];
    this.playlists = [];
    this.currentOffset = 0;
    this.hasMore = true;
    this.totalResults = 0;
    this.loadedResults = 0;
  }

  search(): void {
    if (!this.query.trim()) return;

    this.loading = true;
    this.loadingState = 'searching';
    const limit = 20;

    if (this.searchType === 'all') {
      this.spotifyService
        .searchAll(this.query, limit, this.currentOffset)
        .subscribe({
          next: (response) => {
            this.handleSearchResponse(response);
            this.loading = false;
            this.loadingState = 'idle';
          },
          error: (err) => {
            console.error('Error searching', err);
            this.loading = false;
            this.loadingState = 'idle';
          },
        });
    } else {
      this.spotifyService
        .search({
          query: this.query,
          type: this.searchType,
          limit: limit,
          offset: this.currentOffset,
        })
        .subscribe({
          next: (response) => {
            this.handleSearchResponse(response);
            this.loading = false;
            this.loadingState = 'idle';
          },
          error: (err) => {
            console.error('Error searching', err);
            this.loading = false;
            this.loadingState = 'idle';
          },
        });
    }
  }

  private handleSearchResponse(response: any): void {
    let newItemsCount = 0;

    if (this.currentOffset === 0) {
      // First load - replace all data
      this.tracks = response.tracks?.items || [];
      this.artists = response.artists?.items || [];
      this.albums = response.albums?.items || [];
      this.playlists = response.playlists?.items || [];

      // Set total results from API
      this.totalResults =
        (response.tracks?.total || 0) +
        (response.artists?.total || 0) +
        (response.albums?.total || 0) +
        (response.playlists?.total || 0);

      // Count loaded results
      this.loadedResults =
        this.tracks.length +
        this.artists.length +
        this.albums.length +
        this.playlists.length;
    } else {
      // Load more - append data
      const newTracks = response.tracks?.items || [];
      const newArtists = response.artists?.items || [];
      const newAlbums = response.albums?.items || [];
      const newPlaylists = response.playlists?.items || [];

      this.tracks = [...this.tracks, ...newTracks];
      this.artists = [...this.artists, ...newArtists];
      this.albums = [...this.albums, ...newAlbums];
      this.playlists = [...this.playlists, ...newPlaylists];

      newItemsCount =
        newTracks.length +
        newArtists.length +
        newAlbums.length +
        newPlaylists.length;
      this.loadedResults += newItemsCount;
    }

    // Check if there are more results available AND we actually got new items AND we haven't loaded everything
    const hasNextPages =
      response.tracks?.next ||
      response.artists?.next ||
      response.albums?.next ||
      response.playlists?.next;

    this.hasMore =
      hasNextPages &&
      (this.currentOffset === 0 || newItemsCount > 0) &&
      this.loadedResults < this.totalResults;
  }

  loadMore(): void {
    if (this.loadingState === 'loading-more' || !this.hasMore) return;

    this.loadingState = 'loading-more';
    this.currentOffset += 20;
    this.search();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (
      this.isNearBottom() &&
      this.hasMore &&
      this.loadingState !== 'loading-more' &&
      this.loadingState !== 'searching' &&
      this.hasLoadedResults()
    ) {
      this.loadMore();
    }
  }

  private isNearBottom(): boolean {
    const threshold = 200; // Increased threshold for better UX
    const position = window.pageYOffset + window.innerHeight;
    const height = document.body.scrollHeight;
    return position > height - threshold;
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
    return images && images.length > 0
      ? images[0].url
      : 'assets/placeholder-album.png';
  }

  hasLoadedResults(): boolean {
    return (
      this.tracks.length > 0 ||
      this.artists.length > 0 ||
      this.albums.length > 0 ||
      this.playlists.length > 0
    );
  }
}
