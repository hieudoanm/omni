package eval

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org"
	"github.com/hieudoanm/omni/packages/cli/src/libs/number"
	"github.com/spf13/cobra"
)

func runEval(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")
	fen, _ := cmd.Flags().GetString("fen")
	multiPv, _ := cmd.Flags().GetInt("multipv")

	if fen == "" {
		return fmt.Errorf("--fen is required")
	}
	if multiPv <= 0 {
		multiPv = 1
	}

	eval, err := lichess.CloudEvalAPI(fen, multiPv, "standard")
	if err != nil {
		return fmt.Errorf("failed to fetch evaluation: %w", err)
	}

	if jsonOutput {
		type pvJSON struct {
			Moves string `json:"moves"`
			Cp    int    `json:"cp"`
		}
		var pvs []pvJSON
		for _, pv := range eval.PVs {
			cp := 0
			if pv.Cp != nil {
				cp = *pv.Cp
			}
			pvs = append(pvs, pvJSON{Moves: pv.Moves, Cp: cp})
		}
		b, _ := json.MarshalIndent(map[string]interface{}{
			"fen":   eval.FEN,
			"depth": eval.Depth,
			"nodes": eval.KNodes,
			"pvs":   pvs,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println()
		fmt.Println("♞ lichess.org Cloud Evaluation")
		fmt.Println("------------------------------------------------")
		fmt.Printf("Depth : %d\n", eval.Depth)
		fmt.Printf("Nodes : %s\n", number.Comma(eval.KNodes))
		fmt.Println()

		for i, pv := range eval.PVs {
			cp := 0
			if pv.Cp != nil {
				cp = *pv.Cp
			}
			fmt.Printf(
				"#%d  %+0.2f  %s\n",
				i+1,
				float64(cp)/100.0,
				pv.Moves,
			)
		}
	}

	return nil
}
