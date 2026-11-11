package repair

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "repair <file>",
		Short: "Repair a corrupted PDF",
		Long:  "Attempt to repair a damaged or corrupted PDF file by rebuilding its internal structure.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().StringP("output", "o", "", "Output file path (default: <file>.repaired.pdf)")
	return cmd
}
