import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Player {
  id: number;
  firstname: string;
  lastname: string;
  birth: {
    date: string;
    country: string;
  };
  nba: {
    start: number;
    end: number;
  };
  height: {
    feet: string;
    inches: string;
    meters: string;
  };
  weight: {
    pounds: string;
    kilograms: string;
  };
  college: string;
  affiliation: string;
  leagues: {
    standard: {
      jersey: number;
      active: boolean;
      pos: string;
    }
  };
  lastUpdated: {
    type: Date;
    default: Date;
  }
}

@Injectable({
  providedIn: 'root'
})

export class PlayersService {
    private apiUrl = 'http://localhost:3000/api/players';

    constructor(private http: HttpClient) { }

    getPlayers(): Observable<Player[]> {
        return this.http.get<Player[]>(this.apiUrl);
    }
}