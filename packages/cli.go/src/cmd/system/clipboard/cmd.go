package clipboard

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "clipboard",
		Short:   "Watch clipboard changes and store them in SQLite",
		Long:    `Monitors the system clipboard for changes and saves each unique entry to a local SQLite database.`,
		Example: `  system clipboard`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runWatcherFn()
		},
	}
	cmd.Flags().BoolVarP(&jsonOutput, "json", "j", false, "Output in JSON format")
	return cmd
}
