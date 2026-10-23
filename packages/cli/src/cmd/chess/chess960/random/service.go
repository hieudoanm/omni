package random

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"strings"

	"github.com/spf13/cobra"

	lichess "github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org"
)

func runRandom(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")
	n := len(Positions)
	positionIndex := rand.Intn(n)
	position := Positions[positionIndex]
	fen := fmt.Sprintf("%s/pppppppp/8/8/8/8/PPPPPPPP/%s w KQkq - 0 1",
		strings.ToLower(position), position)
	eval, err := lichess.CloudEvalCP(fen, "chess960")
	if err != nil {
		return fmt.Errorf("failed to evaluate position: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"index":      positionIndex + 1,
			"position":   position,
			"fen":        fen,
			"evaluation": eval,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Printf("Position %d: %s\n", positionIndex+1, position)
		fmt.Println("FEN:", fen)
		fmt.Println("Evaluation (centipawns):", eval)
	}
	return nil
}
