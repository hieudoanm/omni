package stats

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/libs/history"
)

func runStats(jsonOutput bool) error {
	stats, err := history.ComputeStats()
	if err != nil {
		return err
	}
	if jsonOutput {
		out, _ := json.Marshal(stats)
		fmt.Println(string(out))
		return nil
	}
	fmt.Printf("CLI commands:  %d\n", stats.TotalCLI)
	fmt.Printf("MCP tool calls: %d\n", stats.TotalMCP)
	fmt.Println()
	if len(stats.TopCommands) > 0 {
		fmt.Println("Top commands:")
		for _, cc := range stats.TopCommands {
			fmt.Printf("  %5d  %s\n", cc.Count, cc.Name)
		}
	}
	if len(stats.TopErrors) > 0 {
		fmt.Println()
		fmt.Println("Top errors:")
		for _, cc := range stats.TopErrors {
			fmt.Printf("  %5d  %s\n", cc.Count, cc.Name)
		}
	}
	return nil
}
