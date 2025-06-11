import { Routes } from '@angular/router';
import { StandingsComponent } from './components/standings/standings.component';
import { PlayersComponent } from './components/players/players.component';

export const routes: Routes = [
    { path: '', redirectTo: '/standings', pathMatch: 'full' },
    { path: 'standings', component: StandingsComponent},
    { path: '', redirectTo: '/players', pathMatch: 'full' },
    { path: 'players', component: PlayersComponent },
];
