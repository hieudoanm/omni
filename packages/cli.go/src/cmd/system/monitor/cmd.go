package monitor

import (
	tea "charm.land/bubbletea/v2"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "monitor",
		Short: "Monitor system resources in real-time",
		Long:  `Display real-time CPU, memory, and process information in a Bubble Tea TUI, or output a one-shot JSON snapshot with --json.`,
		Example: `  system monitor
  system monitor --json`,
		Args: cobra.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			if jsonOutput {
				return monitorJSON()
			}
			p := tea.NewProgram(model{width: 100})
			_, err := p.Run()
			return err
		},
	}

	cmd.Flags().BoolVarP(&jsonOutput, "json", "j", false, "Output in JSON format")
	return cmd
}
