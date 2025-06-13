import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StandingsService, Standing } from '../../services/standings.service';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.scss']
})
export class StandingsComponent implements OnInit {
  standings: Standing[] = [];
  easternConference: Standing[] = [];
  westernConference: Standing[] = [];
  loading = true;
  error = '';

  constructor(private standingsService: StandingsService) { }

  ngOnInit(): void {
    this.loadStandings();
  }

  loadStandings(): void {
    this.standingsService.getStandings().subscribe({
      next: (data) => {
        this.standings = data;
        this.easternConference = data.filter(team => team.conference.name === 'east');
        this.westernConference = data.filter(team => team.conference.name === 'west');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading standings:', error);
        this.error = 'Failed to load standings';
        this.loading = false;
      }
    });
  }
}