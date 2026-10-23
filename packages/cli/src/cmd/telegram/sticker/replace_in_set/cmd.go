package replace_in_set

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "replace-in-set",
		Short:   "Replace a sticker in a set",
		Long:    `Replace an existing sticker in a set with a new one.`,
		Example: `  telegram sticker replace-in-set --user-id 12345 --name "my_set" --old-sticker FILE_ID --sticker '{"sticker":"NEW_FILE_ID","emoji_list":["😀"]}'`,
		RunE:    runE,
	}

	cmd.Flags().Int64("user-id", 0, "Sticker set owner ID")
	cmd.Flags().String("name", "", "Sticker set short name")
	cmd.Flags().String("old-sticker", "", "File ID of the sticker to replace")
	cmd.Flags().String("sticker", "", "JSON object with new sticker data")

	return cmd
}
