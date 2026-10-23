package diff

import (
	"encoding/json"
	"fmt"
	"math"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/elo/internal"
	"github.com/spf13/cobra"
)

func runDiff(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	diff, _ := cmd.Flags().GetFloat64("difference")
	expScore, _ := cmd.Flags().GetFloat64("expected-score")

	hasDiff := cmd.Flags().Changed("difference")
	hasExp := cmd.Flags().Changed("expected-score")

	if hasDiff && hasExp {
		return fmt.Errorf("provide only one of --difference or --expected-score")
	}
	if !hasDiff && !hasExp {
		return fmt.Errorf("provide either --difference or --expected-score")
	}

	if hasDiff {
		exp := internal.DiffToExpected(diff)
		if jsonOut {
			b, _ := json.MarshalIndent(map[string]interface{}{
				"mode":              "diff-to-expected",
				"rating_difference": diff,
				"expected_score":    exp,
				"expected_pct":      exp * 100,
			}, "", "  ")
			fmt.Println(string(b))
			return nil
		}
		fmt.Println()
		fmt.Println("♞ Rating Difference → Expected Score")
		fmt.Println("------------------------------------------------")
		fmt.Printf("Rating Difference : %.0f\n", diff)
		fmt.Printf("Expected Score    : %.3f\n", exp)
		fmt.Printf("Expected %%        : %.1f%%\n", exp*100)
		return nil
	}

	if expScore <= 0 || expScore >= 1 {
		return fmt.Errorf("expected score must be between 0 and 1 (exclusive)")
	}
	D := internal.ExpectedToDiff(expScore)
	if jsonOut {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"mode":              "expected-to-diff",
			"expected_score":    expScore,
			"rating_difference": math.Round(D),
		}, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	sign := "+"
	if D < 0 {
		sign = ""
	}
	fmt.Println()
	fmt.Println("♞ Expected Score → Rating Difference")
	fmt.Println("------------------------------------------------")
	fmt.Printf("Expected Score    : %.3f\n", expScore)
	fmt.Printf("Rating Difference : %s%.0f\n", sign, D)
	return nil
}
