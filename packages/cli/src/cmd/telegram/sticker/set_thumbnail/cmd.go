package set_thumbnail

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "set-thumbnail",
		Short:   "Set sticker set thumbnail",
		Long:    `Set the thumbnail of a sticker set.`,
		Example: `  telegram sticker set-thumbnail --name "my_set" --user-id 12345 --thumbnail FILE_ID`,
		RunE:    runE,
	}

	cmd.Flags().String("name", "", "Sticker set short name")
	cmd.Flags().Int64("user-id", 0, "Sticker set owner ID")
	cmd.Flags().String("thumbnail", "", "Thumbnail file ID or URL")
	cmd.Flags().String("format", "static", "Thumbnail format: static/animated/video")

	return cmd
}
