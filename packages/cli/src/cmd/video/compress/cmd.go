package compress

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "compress <file>",
		Short: "Compress video using CRF encoding",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runCompress(args[0])
		},
	}
	cmd.Flags().IntVarP(&quality, "quality", "q", 23, "CRF value 0-51 (lower = better quality)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
