package remove_from_set

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "remove-from-set",
		Short:   "Remove a sticker from a set",
		Long:    `Remove a sticker from a set.`,
		Example: `  telegram sticker remove-from-set --sticker FILE_ID`,
		RunE:    runE,
	}

	cmd.Flags().String("sticker", "", "File ID of the sticker to remove")

	return cmd
}
