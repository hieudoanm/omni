package edit

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/edit/compress"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/edit/redact"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/edit/rotate"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/edit/watermark"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "edit",
		Short: "Modify PDF content: compress, rotate, watermark, redact",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(compress.NewCommand())
	cmd.AddCommand(rotate.NewCommand())
	cmd.AddCommand(watermark.NewCommand())
	cmd.AddCommand(redact.NewCommand())
	return cmd
}
