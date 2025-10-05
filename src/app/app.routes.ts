import { Routes } from '@angular/router';
import { AlbumComponent } from './components/album/album.component';
import { ArtistComponent } from './components/artist/artist.component';
import { SearchComponent } from './components/search/search.component';
import { TrackComponent } from './components/track/track.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PlaylistComponent } from './components/playlist/playlist.component';
import { CategoryComponent } from './components/category/category.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'search', component: SearchComponent },
  { path: 'artist/:id', component: ArtistComponent },
  { path: 'album/:id', component: AlbumComponent },
  { path: 'track/:id', component: TrackComponent },
  { path: 'playlist/:id', component: PlaylistComponent },
  { path: 'category/:id', component: CategoryComponent },
];
