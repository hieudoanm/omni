package compress

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "compress <file>",
		Short: "Compress PDF file size",
		Long:  "Reduce PDF file size by optimizing content streams and removing redundant data.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().StringP("output", "o", "", "Output file path (default: overwrite input)")
	return cmd
}
