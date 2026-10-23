package compress

import (
	"github.com/spf13/cobra"
)

var quality int
var format string
var output string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "compress <file>",
		Short: "Compress image (reduce file size)",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runCompress(args[0], jsonOut)
		},
	}
	cmd.Flags().IntVarP(&quality, "quality", "q", 80, "Output quality (1-100)")
	cmd.Flags().StringVarP(&format, "format", "f", "", "Output format (jpg, png, gif)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
