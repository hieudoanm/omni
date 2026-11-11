package icons

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "icons <file>",
		Short: "Generate app icons in multiple sizes",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runIcons(args[0])
		},
	}
	cmd.Flags().IntSliceVarP(&sizes, "sizes", "s", []int{192, 512}, "Icon sizes to generate")
	return cmd
}
