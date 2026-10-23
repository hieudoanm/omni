package validate

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cobra"
)

func runValidate(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")
	pos := strings.ToUpper(args[0])
	if len(pos) != 8 {
		return fmt.Errorf("position must be exactly 8 characters, got %d", len(pos))
	}
	counts := map[rune]int{}
	for _, ch := range pos {
		counts[ch]++
	}
	if counts['K'] != 1 {
		return fmt.Errorf("must have exactly one king, got %d", counts['K'])
	}
	if counts['Q'] != 1 {
		return fmt.Errorf("must have exactly one queen, got %d", counts['Q'])
	}
	if counts['R'] != 2 {
		return fmt.Errorf("must have exactly two rooks, got %d", counts['R'])
	}
	if counts['B'] != 2 {
		return fmt.Errorf("must have exactly two bishops, got %d", counts['B'])
	}
	if counts['N'] != 2 {
		return fmt.Errorf("must have exactly two knights, got %d", counts['N'])
	}
	bishopPositions := []int{}
	for i, ch := range pos {
		if ch == 'B' {
			bishopPositions = append(bishopPositions, i)
		}
	}
	if bishopPositions[0]%2 == bishopPositions[1]%2 {
		return fmt.Errorf("bishops must be on opposite-colored squares")
	}
	kingPos := strings.Index(pos, "K")
	rook1Pos := strings.Index(pos, "R")
	rook2Pos := strings.LastIndex(pos, "R")
	if !(rook1Pos < kingPos && kingPos < rook2Pos) {
		return fmt.Errorf("king must be between the two rooks")
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"position": pos,
			"valid":    true,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Printf("✓ %s is a valid Chess960 position\n", pos)
	}
	return nil
}
