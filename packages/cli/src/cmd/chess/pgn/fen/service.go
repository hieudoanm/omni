package fen

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/internal"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org"
	"github.com/notnil/chess"
	"github.com/spf13/cobra"
)

func runFen(cmd *cobra.Command, args []string) error {
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

	pgn = strings.ReplaceAll(pgn, ". ", ".")

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

	position := chess.NewGame()
	var prevEval int

	type moveRow struct {
		MoveNumber int    `json:"move_number"`
		Side       string `json:"side"`
		SAN        string `json:"san"`
		FEN        string `json:"fen"`
		Eval       int    `json:"eval"`
		CPLoss     int    `json:"cp_loss"`
		Label      string `json:"label"`
	}
	var rows []moveRow

	for i, move := range moves {
		position.Move(move)
		fen := position.Position().String()

		var eval int
		v, err := lichess.CloudEvalCP(fen, "standard")
		if err == nil {
			eval = v
		}
		time.Sleep(300 * time.Millisecond)

		cpLoss := internal.Abs(eval - prevEval)
		prevEval = eval

		side := "White"
		if i%2 == 1 {
			side = "Black"
		}
		moveNumber := (i / 2) + 1
		label := classifyMove(cpLoss)

		rows = append(rows, moveRow{
			MoveNumber: moveNumber,
			Side:       side,
			SAN:        move.String(),
			FEN:        fen,
			Eval:       eval,
			CPLoss:     cpLoss,
			Label:      label,
		})
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"moves": rows,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Printf("| %-4s | %-5s | %-6s | %-72s | %-7s | %-7s | %-10s |\n",
			"Move", "Side", "SAN", "FEN", "Eval", "Loss", "Label")
		fmt.Printf("| %-4s | %-5s | %-6s | %-72s | %-7s | %-7s | %-10s |\n", strings.Repeat("-", 4), strings.Repeat("-", 5), strings.Repeat("-", 6), strings.Repeat("-", 72), strings.Repeat("-", 7), strings.Repeat("-", 7), strings.Repeat("-", 10))

		for _, row := range rows {
			fmt.Printf("| %-4d | %-5s | %-6s | %-72s | %-7d | %-7d | %-10s |\n",
				row.MoveNumber, row.Side, row.SAN, row.FEN, row.Eval, row.CPLoss, row.Label)
		}
	}

	return nil
}

func classifyMove(cp int) string {
	switch {
	case cp <= 20:
		return "Best"
	case cp <= 50:
		return "Good"
	case cp <= 100:
		return "Inaccuracy"
	case cp <= 200:
		return "Mistake"
	default:
		return "Blunder"
	}
}
