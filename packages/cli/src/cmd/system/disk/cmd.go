package disk

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/system/disk/stats"
)

func NewCmd() *cobra.Command {
	var showJSON bool
	var filter string
	var sortBySize bool

	cmd := &cobra.Command{
		Use:   "disk",
		Short: "Show disk usage for mounted filesystems",
		Long:  `Display filesystem disk space usage for all mounted partitions.`,
		Example: `  system disk
  system disk --sort
  system disk --json
  system disk --filter /dev`,
		Args: cobra.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runDisk(showJSON, filter, sortBySize)
		},
	}

	cmd.Flags().BoolVarP(&showJSON, "json", "j", false, "Output in JSON format")
	cmd.Flags().StringVarP(&filter, "filter", "f", "", "Filter by mount point or device")
	cmd.Flags().BoolVarP(&sortBySize, "sort", "s", false, "Sort by usage percent")
	cmd.AddCommand(stats.NewCmd())
	return cmd
}
