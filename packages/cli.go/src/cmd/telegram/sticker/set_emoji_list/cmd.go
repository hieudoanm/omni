package set_emoji_list

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "set-emoji-list",
		Short:   "Set sticker emoji list",
		Long:    `Change the list of emoji associated with a sticker.`,
		Example: `  telegram sticker set-emoji-list --sticker FILE_ID --emoji-list '["😀","😂"]'`,
		RunE:    runE,
	}

	cmd.Flags().String("sticker", "", "File ID of the sticker")
	cmd.Flags().String("emoji-list", "", "JSON array of emoji strings")

	return cmd
}
