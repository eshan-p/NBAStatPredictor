import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PlayersService, Player } from "../../services/players.service";

@Component({
  selector: "app-players",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./players.component.html",
  styleUrls: ["./players.component.scss"],
})
export class PlayersComponent implements OnInit {
  players: Player[] = [];
  loading = true;
  error = "";

  constructor(private playersService: PlayersService) {}

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.playersService.getPlayers().subscribe({
      next: (data) => {
        this.players = data;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading players:", error);
        this.error = "Failed to load players";
        this.loading = false;
      },
    });
  }
}
// This component fetches and displays a list of players from the NBA API.