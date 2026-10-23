package info

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type TournamentInfo struct {
	Name        string             `json:"name"`
	URL         string             `json:"url"`
	Description string             `json:"description"`
	Creator     string             `json:"creator"`
	Status      string             `json:"status"`
	FinishTime  int64              `json:"finish_time"`
	Settings    TournamentSettings `json:"settings"`
	Players     []TournamentPlayer `json:"players"`
	Rounds      []string           `json:"rounds"`
}

type TournamentSettings struct {
	Type                       string `json:"type"`
	Rules                      string `json:"rules"`
	TimeClass                  string `json:"time_class"`
	TimeControl                string `json:"time_control"`
	IsRated                    bool   `json:"is_rated"`
	IsOfficial                 bool   `json:"is_official"`
	IsInviteOnly               bool   `json:"is_invite_only"`
	InitialGroupSize           int    `json:"initial_group_size"`
	UserAdvanceCount           int    `json:"user_advance_count"`
	UseTiebreak                bool   `json:"use_tiebreak"`
	AllowVacation              bool   `json:"allow_vacation"`
	WinnerPlaces               int    `json:"winner_places"`
	RegisteredUserCount        int    `json:"registered_user_count"`
	GamesPerOpponent           int    `json:"games_per_opponent"`
	TotalRounds                int    `json:"total_rounds"`
	ConcurrentGamesPerOpponent int    `json:"concurrent_games_per_opponent"`
}

type TournamentPlayer struct {
	Username string `json:"username"`
	Status   string `json:"status"`
}

func runTournamentInfo(cmd *cobra.Command, args []string) error {
	tournamentID, _ := cmd.Flags().GetString("tournament")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/tournament/%s", tournamentID)
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch tournament: %w", err)
	}
	var info TournamentInfo
	if err := json.Unmarshal(body, &info); err != nil {
		return fmt.Errorf("failed to parse tournament: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(info, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	fmt.Println()
	fmt.Printf("Tournament: %s\n", info.Name)
	fmt.Println(strings.Repeat("-", 50))
	fmt.Printf("Status : %s\n", info.Status)
	fmt.Printf("Type   : %s\n", info.Settings.Type)
	fmt.Printf("Time   : %s %s\n", info.Settings.TimeClass, info.Settings.TimeControl)
	fmt.Printf("Players: %d\n", len(info.Players))
	fmt.Printf("Rounds : %d\n", len(info.Rounds))
	return nil
}
