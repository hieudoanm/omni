package video

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/video/compress"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/video/convert"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/video/extractaudio"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/video/mute"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/video/resize"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/video/subtitles"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/video/togif"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/video/tomp3"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/video/trim"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "video",
		Short: "Video processing tools",
		Long:  "Video processing tools using ffmpeg for compression, trimming, conversion, and more.",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(compress.NewCmd())
	cmd.AddCommand(convert.NewCmd())
	cmd.AddCommand(extractaudio.NewCmd())
	cmd.AddCommand(mute.NewCmd())
	cmd.AddCommand(resize.NewCmd())
	cmd.AddCommand(subtitles.NewCmd())
	cmd.AddCommand(togif.NewCmd())
	cmd.AddCommand(tomp3.NewCmd())
	cmd.AddCommand(trim.NewCmd())
	return cmd
}
