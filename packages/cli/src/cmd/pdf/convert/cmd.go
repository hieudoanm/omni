package convert

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/convert/fromimages"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/convert/toimages"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "convert",
		Short: "Convert PDF to/from images",
		Long:  "Convert PDF pages to images or create PDF from image files.",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(toimages.NewCommand())
	cmd.AddCommand(fromimages.NewCommand())
	return cmd
}
