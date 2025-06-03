import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Standing {
  team: {
    name: string;
    abbreviation: string;
    logo: string;
  };
  conference: string;
  division: string;
  wins: number;
  losses: number;
  winPercentage: number;
  gamesBack: string;
  streak: string;
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