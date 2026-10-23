package now

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "now",
		Short: "Display current date and time",
		Long: `Display the current date and time in the local time zone.
Supports JSON output and custom format strings.`,
		Example: `  time clock now
  time clock now --json
  time clock now --format "2006-01-02 15:04:05"`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			format, _ := cmd.Flags().GetString("format")
			return RunNow(format, jsonOutput)
		},
	}
	cmd.Flags().Bool("json", false, "Output in JSON format")
	cmd.Flags().String("format", "", "Custom Go time format string")
	return cmd
}
