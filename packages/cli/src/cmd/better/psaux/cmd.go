package psaux

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var sortBy string
	var user string

	cmd := &cobra.Command{
		Use:   "psaux",
		Short: "All processes in a clean table (like ps aux)",
		Long: `Show every process with full details in an aligned table.

Columns: USER, PID, CPU%, MEM%, RSS, VSZ, STAT, TIME, COMMAND
Filters by user with --user.`,
		Example: `  better psaux
  better psaux --sort cpu
  better psaux --sort mem
  better psaux --user root
  better psaux --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return run(sortBy, user, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&sortBy, "sort", "s", "pid", "Sort column: pid, cpu, mem, user")
	cmd.Flags().StringVarP(&user, "user", "u", "", "Filter by user name")
	return cmd
}
