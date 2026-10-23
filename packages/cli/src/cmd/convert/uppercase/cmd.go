package uppercase

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "uppercase <text>",
		Short: "Convert text to uppercase",
		Args:  cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return Run(cmd, args)
		},
	}
}
