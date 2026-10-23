package stats

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var showAll bool

	cmd := &cobra.Command{
		Use:   "stats",
		Short: "Show disk partition statistics",
		Long:  `Display file system disk space statistics including total, used, and available space for each partition.`,
		Example: `  system disk stats
  system disk stats --all`,
		Args: cobra.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return statsRun(showAll)
		},
	}

	cmd.Flags().BoolVarP(&showAll, "all", "a", false, "Show all partitions including virtual/dev")

	return cmd
}
