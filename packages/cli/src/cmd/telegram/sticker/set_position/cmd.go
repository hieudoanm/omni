package set_position

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "set-position",
		Short:   "Set sticker position in set",
		Long:    `Set the position of a sticker in the set.`,
		Example: `  telegram sticker set-position --sticker FILE_ID --position 2`,
		RunE:    runE,
	}

	cmd.Flags().String("sticker", "", "File ID of the sticker")
	cmd.Flags().Int("position", 0, "New position (0-based)")

	return cmd
}
