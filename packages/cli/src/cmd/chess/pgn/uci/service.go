package uci

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/notnil/chess"
	"github.com/spf13/cobra"
)

func runUci(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")
	pgnFile, _ := cmd.Flags().GetString("pgn-file")
	pgnString, _ := cmd.Flags().GetString("pgn")

	if pgnFile == "" && pgnString == "" {
		return fmt.Errorf("❌ you must provide either --pgn-file or --pgn")
	}
	if pgnFile != "" && pgnString != "" {
		return fmt.Errorf("❌ please provide only one of --pgn-file or --pgn")
	}

	var pgn string
	if pgnFile != "" {
		data, err := os.ReadFile(pgnFile)
		if err != nil {
			return fmt.Errorf("❌ failed to read PGN file: %w", err)
		}
		pgn = string(data)
	} else {
		pgn = strings.TrimSpace(pgnString)
	}

	game := chess.NewGame()
	opt, err := chess.PGN(strings.NewReader(pgn))
	if err != nil {
		return fmt.Errorf("❌ failed to parse PGN: %w", err)
	}
	opt(game)

	moves := game.Moves()
	if len(moves) == 0 {
		return fmt.Errorf("❌ no moves found in PGN")
	}

	var uciMoves []string
	position := chess.NewGame()
	for _, move := range moves {
		uciMoves = append(uciMoves, move.String())
		position.Move(move)
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"moves": uciMoves,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println(strings.Join(uciMoves, " "))
	}
	return nil
}
