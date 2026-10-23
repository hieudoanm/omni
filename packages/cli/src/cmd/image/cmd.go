package image

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/background"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/blur"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/border"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/collage"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/combine"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/compress"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/convert"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/crop"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/dominant"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/flip"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/grayscale"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/icons"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/info"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/pixelate"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/resize"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/round"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/sharpen"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/split"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/image/text"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "image",
		Short: "Image processing tools",
		Long:  "Image processing tools including format conversion, color analysis, and metadata extraction.",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(background.NewCmd())
	cmd.AddCommand(blur.NewCmd())
	cmd.AddCommand(border.NewCmd())
	cmd.AddCommand(collage.NewCmd())
	cmd.AddCommand(combine.NewCmd())
	cmd.AddCommand(compress.NewCmd())
	cmd.AddCommand(convert.NewCmd())
	cmd.AddCommand(crop.NewCmd())
	cmd.AddCommand(dominant.NewCmd())
	cmd.AddCommand(flip.NewCmd())
	cmd.AddCommand(grayscale.NewCmd())
	cmd.AddCommand(icons.NewCmd())
	cmd.AddCommand(info.NewCmd())
	cmd.AddCommand(pixelate.NewCmd())
	cmd.AddCommand(resize.NewCmd())
	cmd.AddCommand(round.NewCmd())
	cmd.AddCommand(sharpen.NewCmd())
	cmd.AddCommand(split.NewCmd())
	cmd.AddCommand(text.NewCmd())
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	cmd.PersistentFlags().BoolP("verbose", "v", false, "Verbose output")
	return cmd
}
