import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Standing {
  league: string;
  season: number;
  team: {
    id: number;
    name: string;
    nickname: string;
    code: string;
    logo: string
  };
  conference: {
    name: string;
    rank: number;
    win: number;
    loss: number
  };
  division: {
    name: string;
    rank: number;
    win: number;
    loss: number;
    gamesBehind: string
  };
  win: {
    home: number;
    away: number;
    total: number;
    percentage: string;
    lastTen: number
  };
  loss: {
    home: number;
    away: number;
    total: number;
    percentage: string;
    lastTen: number
  };
  gamesBehind: string;
  streak: number;
  winStreak: boolean;
  tieBreakerPoints: null;
  lastUpdated: {
    type: Date;
    default: Date;
  }
}

@Injectable({
  providedIn: 'root'
})
export class StandingsService {
  private apiUrl = 'http://localhost:3000/api/standings';

  constructor(private http: HttpClient) { }

  getStandings(): Observable<Standing[]> {
    return this.http.get<Standing[]>(this.apiUrl);
  }
}