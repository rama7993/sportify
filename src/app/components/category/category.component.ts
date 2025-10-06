import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpotifyService, Track } from '../../../services/spotify.service';
import { Subject, takeUntil, switchMap } from 'rxjs';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [RouterLink, CommonModule, BreadcrumbComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent implements OnInit, OnDestroy {
  categoryId!: string;
  category: any = null;
  playlists: any[] = [];
  breadcrumbs: BreadcrumbItem[] = [];
  errorMessage: string = '';

  loading = {
    category: true,
    playlists: true,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.categoryId = params.get('id') || '';

          if (this.categoryId) {
            this.loadCategoryData();
          }
          return [];
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategoryData(): void {
    this.errorMessage = ''; // Clear any previous error messages
    this.playlists = []; // Clear previous playlists
    this.loadCategoryDetails();
    this.loadCategoryPlaylists();
  }

  private loadCategoryDetails(): void {
    this.loading.category = true;
    this.spotifyService
      .getCategory(this.categoryId, 'en_IN')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.category = response;
          this.loading.category = false;
          this.setBreadcrumbs();
        },
        error: (error) => {
          console.error('Error loading category details:', error);
          this.loading.category = false;
          this.errorMessage = `Category '${this.categoryId}' not found or not available.`;
        },
      });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: 'Home', route: ['/'], icon: 'fas fa-home' },
      { label: 'Categories', route: ['/'], icon: 'fas fa-th-large' },
      { label: this.category?.name || this.categoryId, icon: 'fas fa-music' },
    ];
  }

  private loadCategoryPlaylists(): void {
    this.loading.playlists = true;

    this.spotifyService
      .getPlaylistsByCategory(this.categoryId, 20, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const playlists = response.playlists?.items || response.items || [];
          this.playlists = this.filterValidPlaylists(playlists);
          this.loading.playlists = false;
        },
        error: (error) => {
          console.error('Error loading category playlists:', error);
          this.playlists = [];
          this.loading.playlists = false;
          this.errorMessage = `Unable to load playlists for category '${this.categoryId}'.`;
        },
      });
  }

  private filterValidPlaylists(playlists: any[]): any[] {
    return playlists.filter((playlist) => {
      return (
        playlist &&
        playlist.name &&
        playlist.name.trim() !== '' &&
        playlist.name !== 'null' &&
        playlist.owner &&
        playlist.owner.display_name &&
        playlist.owner.display_name !== 'null'
      );
    });
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

  getPlaylistImageUrl(images: any[]): string {
    if (images && images.length > 0 && images[0] && images[0].url) {
      return images[0].url;
    }
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWMTQwSDgwVjYwWiIgZmlsbD0iIzQ0NDQ0NCIvPgo8cGF0aCBkPSJNODAgNjBIMTIwVjgwSDgwVjYwWiIgZmlsbD0iIzU1NTU1NSIvPgo8cGF0aCBkPSJNODAgODBIMTIwVjEwMEg4MFY4MFoiIGZpbGw9IiM2NjY2NjYiLz4KPHA+PC9wYXRoPgo8cGF0aCBkPSJNODAgMTAwSDEyMFYxMjBIODBWMTAwWiIgZmlsbD0iIzc3Nzc3NyIvPgo8cGF0aCBkPSJNODAgMTIwSDEyMFYxNDBIODBWMjIwWiIgZmlsbD0iIzg4ODg4OCIvPgo8L3N2Zz4K';
  }

  getCategoryIconUrl(icons: any[]): string {
    if (icons && icons.length > 0 && icons[0] && icons[0].url) {
      return icons[0].url;
    }
    return '';
  }
}
