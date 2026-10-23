package ps

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var all bool
	var sortBy string
	var long bool
	var human bool

	cmd := &cobra.Command{
		Use:   "ps",
		Short: "List processes in a clean table",
		Long: `Show running processes sorted and filtered, with aligned table output.

Columns: PID, CPU%, MEM%, COMMAND
With --long: PPID, RSS, VSZ, STAT are added.`,
		Example: `  better ps
  better ps --all
  better ps --sort cpu
  better ps --sort mem
  better ps --long
  better ps --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return run(all, sortBy, long, human, jsonOutput)
		},
	}

	cmd.Flags().BoolVarP(&all, "all", "a", false, "Show processes from all users")
	cmd.Flags().StringVarP(&sortBy, "sort", "s", "pid", "Sort column: pid, cpu, mem")
	cmd.Flags().BoolVarP(&long, "long", "l", false, "Long format with PPID, RSS, VSZ, STAT")
	cmd.Flags().BoolVarP(&human, "human", "H", false, "Human-readable RSS/VSZ (requires --long)")
	return cmd
}
