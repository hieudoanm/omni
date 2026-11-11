package convert

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "convert <file>",
		Short: "Convert image format",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runConvert(args[0])
		},
	}
	cmd.Flags().StringVarP(&outputFormat, "format", "f", "png", "Output format (png, jpg, gif, webp)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
