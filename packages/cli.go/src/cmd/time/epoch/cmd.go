package epoch

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "epoch [timestamp]",
		Short: "Convert between epoch timestamps and human-readable dates",
		Long:  `Convert Unix epoch timestamps to human-readable dates and vice versa.`,
		Example: `  epoch
  epoch 1718100000
  epoch --from 2024-06-11
  epoch --relative "2 hours ago"
  epoch 1718100000 --iso
  epoch 1718100000 --format "2006-01-02"`,
		RunE: func(cmd *cobra.Command, args []string) error {
			fromDate, _ := cmd.Flags().GetString("from")
			relative, _ := cmd.Flags().GetString("relative")
			format, _ := cmd.Flags().GetString("format")
			iso, _ := cmd.Flags().GetBool("iso")
			unix, _ := cmd.Flags().GetBool("unix")
			epochJSON, _ := cmd.Flags().GetBool("json")
			return runEpoch(args, fromDate, relative, format, iso, unix, epochJSON)
		},
	}
	cmd.Flags().String("from", "", "Convert a date string to epoch")
	cmd.Flags().String("relative", "", "Calculate epoch relative to now (e.g. '2 hours ago')")
	cmd.Flags().String("format", "", "Output format string (Go time layout)")
	cmd.Flags().Bool("iso", false, "Output in ISO 8601 format")
	cmd.Flags().Bool("unix", false, "Output Unix timestamp (useful with --json)")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
