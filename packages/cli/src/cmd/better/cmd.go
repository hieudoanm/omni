package better

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/better/du"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/better/env"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/better/find"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/better/ls"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/better/ps"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/better/psaux"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/better/which"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "better",
		Short: "Better replacements for common Unix commands",
		Long: `Improved versions of everyday Unix commands with table output, JSON formatting, and more options.

  better du      - show disk usage by directory
  better env     - show environment variables in a clean table
  better find    - recursively find files and directories
  better ls      - list directory contents with details
  better ps      - list processes in a clean table
  better psaux   - all processes in a clean table (like ps aux)
  better which   - locate executable commands in PATH`,
		Example: `  better ls
  better ls --long
  better ls --long --all --human
  better ls --dir /tmp --json
  better find --name "*.go"
  better find --name config --type f
  better ps --all --sort cpu
  better psaux --sort mem
  better du --human --depth 2
  better env --name PATH
  better which --all go`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(du.NewCommand())
	cmd.AddCommand(env.NewCommand())
	cmd.AddCommand(find.NewCommand())
	cmd.AddCommand(ls.NewCommand())
	cmd.AddCommand(ps.NewCommand())
	cmd.AddCommand(psaux.NewCommand())
	cmd.AddCommand(which.NewCommand())
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
