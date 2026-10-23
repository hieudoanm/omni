package system

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/system/battery"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/system/clipboard"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/system/disk"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/system/env"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/system/info"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/system/monitor"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/system/path"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "system",
		Short: "System utilities",
		Long:  `System monitoring and clipboard management.`,
		Example: `  system monitor
  system info
  system disk
  system battery
  system env PATH
  system path go`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(
		monitor.NewCmd(),
		clipboard.NewCmd(),
		info.NewCmd(),
		env.NewCmd(),
		path.NewCmd(),
		disk.NewCmd(),
		battery.NewCmd(),
	)
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
