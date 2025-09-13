import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpotifyService, Track, SearchResponse } from '../../../services/spotify.service';
import { RouterLink } from '@angular/router';
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
  loadingMore: boolean = false;
  hasMore: boolean = true;
  currentOffset: number = 0;
  totalResults: number = 0;
  searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private spotifyService: SpotifyService) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.search();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
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
  }

  search(): void {
    if (!this.query.trim()) return;

    this.loading = true;
    const limit = 20;

    if (this.searchType === 'all') {
      this.spotifyService.searchAll(this.query, limit, this.currentOffset).subscribe({
        next: (response) => {
          this.handleSearchResponse(response);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error searching', err);
          this.loading = false;
        },
      });
    } else {
      this.spotifyService.search({
        query: this.query,
        type: this.searchType,
        limit: limit,
        offset: this.currentOffset
      }).subscribe({
        next: (response) => {
          this.handleSearchResponse(response);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error searching', err);
          this.loading = false;
        },
      });
    }
  }

  private handleSearchResponse(response: any): void {
    if (this.currentOffset === 0) {
      // First load - replace all data
      this.tracks = response.tracks?.items || [];
      this.artists = response.artists?.items || [];
      this.albums = response.albums?.items || [];
      this.playlists = response.playlists?.items || [];
      this.totalResults = (response.tracks?.total || 0) + 
                         (response.artists?.total || 0) + 
                         (response.albums?.total || 0) + 
                         (response.playlists?.total || 0);
    } else {
      // Load more - append data
      this.tracks = [...this.tracks, ...(response.tracks?.items || [])];
      this.artists = [...this.artists, ...(response.artists?.items || [])];
      this.albums = [...this.albums, ...(response.albums?.items || [])];
      this.playlists = [...this.playlists, ...(response.playlists?.items || [])];
    }

    this.hasMore = response.tracks?.next || response.artists?.next || 
                   response.albums?.next || response.playlists?.next;
    this.loadingMore = false;
  }

  loadMore(): void {
    if (this.loadingMore || !this.hasMore) return;

    this.loadingMore = true;
    this.currentOffset += 20;
    this.search();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.isNearBottom() && this.hasMore && !this.loadingMore) {
      this.loadMore();
    }
  }

  private isNearBottom(): boolean {
    const threshold = 100;
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
    return images && images.length > 0 ? images[0].url : 'assets/placeholder-album.png';
  }
}
