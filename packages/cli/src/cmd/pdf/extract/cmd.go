package extract

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/extract/images"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/extract/text"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "extract",
		Short: "Extract content from PDF",
		Long:  "Extract text or images from PDF files.",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(text.NewCommand())
	cmd.AddCommand(images.NewCommand())
	return cmd
}
