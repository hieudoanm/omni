package crop

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "crop <file>",
		Short: "Crop PDF pages",
		Long:  "Crop PDF pages to a specified bounding box region.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().String("bbox", "0 0 612 792", "Bounding box (llx lly urx ury) in PDF points")
	cmd.Flags().StringP("pages", "p", "", "Page ranges to crop (default: all)")
	cmd.Flags().StringP("output", "o", "", "Output file path (default: overwrite input)")
	return cmd
}
