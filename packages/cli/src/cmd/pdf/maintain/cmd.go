package maintain

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/maintain/ocr"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/maintain/repair"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "maintain",
		Short: "Repair and OCR PDF documents",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(repair.NewCommand())
	cmd.AddCommand(ocr.NewCommand())
	return cmd
}
