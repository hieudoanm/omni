package export

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type GameExport struct {
	ID        string `json:"id"`
	Rated     bool   `json:"rated"`
	Variant   string `json:"variant"`
	Speed     string `json:"speed"`
	Perf      string `json:"perf"`
	CreatedAt int64  `json:"createdAt"`
	Status    string `json:"status"`
	Fen       string `json:"fen"`
	LastMove  string `json:"lastMove,omitempty"`
	Moves     string `json:"moves,omitempty"`
	Winner    string `json:"winner,omitempty"`
	Players   struct {
		White GamePlayer `json:"white"`
		Black GamePlayer `json:"black"`
	} `json:"players"`
	Clock   *GameClock   `json:"clock,omitempty"`
	Opening *GameOpening `json:"opening,omitempty"`
}

type GamePlayer struct {
	User    *LightUser `json:"user,omitempty"`
	Rating  int        `json:"rating"`
	AiLevel int        `json:"aiLevel,omitempty"`
	Name    string     `json:"name,omitempty"`
}

type GameClock struct {
	Limit     int `json:"limit"`
	Increment int `json:"increment"`
}

type GameOpening struct {
	Eco  string `json:"eco"`
	Name string `json:"name"`
	Ply  int    `json:"ply"`
}

type LightUser struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	Title *string `json:"title,omitempty"`
}

func runExport(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	gameID := args[0]

	body, err := requests.Get(
		fmt.Sprintf("https://lichess.org/game/export/%s", gameID),
		requests.Options{Query: map[string]string{"pgnInJson": "true"}},
	)
	if err != nil {
		return fmt.Errorf("failed to fetch game: %w", err)
	}

	var game GameExport
	if err := json.Unmarshal(body, &game); err != nil {
		return fmt.Errorf("failed to parse game: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(game, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Printf("♞ Game %s\n", game.ID)
	fmt.Println("------------------------------------------------")
	fmt.Printf("Variant : %s (%s)\n", game.Variant, game.Speed)
	fmt.Printf("Status  : %s\n", game.Status)
	if game.Rated {
		fmt.Println("Rated   : yes")
	}

	white := game.Players.White
	black := game.Players.Black
	wName := white.Name
	if white.User != nil {
		wName = white.User.Name
	}
	bName := black.Name
	if black.User != nil {
		bName = black.User.Name
	}
	fmt.Printf("White   : %s (%d)\n", wName, white.Rating)
	fmt.Printf("Black   : %s (%d)\n", bName, black.Rating)

	if game.Winner != "" {
		fmt.Printf("Winner  : %s\n", game.Winner)
	}
	if game.Opening != nil {
		fmt.Printf("Opening : %s (%s)\n", game.Opening.Name, game.Opening.Eco)
	}
	if game.Clock != nil {
		fmt.Printf("Clock   : %d+%d\n", game.Clock.Limit, game.Clock.Increment)
	}

	return nil
}
