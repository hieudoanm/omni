package file

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/checksum"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/chmod"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/count"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/duplicates"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/edit"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/grep"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/head"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/read"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/size"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/stats"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/tail"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/type"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/write"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "file",
		Short: "File introspection and analysis tools",
		Long:  `Check file checksums, detect types, analyze sizes, find duplicates, search, read, write, and edit files.`,
		Example: `  file checksum --file document.pdf --algorithm sha256
  file type --file image.png
  file read -f main.go --lines 50
  file grep --pattern "TODO" --path .`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(checksum.NewCommand())
	cmd.AddCommand(chmod.NewCommand())
	cmd.AddCommand(count.NewCommand())
	cmd.AddCommand(duplicates.NewCommand())
	cmd.AddCommand(edit.NewCommand())
	cmd.AddCommand(grep.NewCommand())
	cmd.AddCommand(head.NewCommand())
	cmd.AddCommand(read.NewCommand())
	cmd.AddCommand(size.NewCommand())
	cmd.AddCommand(stats.NewCommand())
	cmd.AddCommand(tail.NewCommand())
	cmd.AddCommand(ftype.NewCommand())
	cmd.AddCommand(write.NewCommand())
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
