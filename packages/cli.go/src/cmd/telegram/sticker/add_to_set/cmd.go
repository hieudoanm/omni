package add_to_set

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "add-to-set",
		Short:   "Add a sticker to a set",
		Long:    `Add a new sticker to a set created by the bot.`,
		Example: `  telegram sticker add-to-set --user-id 12345 --name "my_set" --sticker '{"sticker":"FILE_ID","emoji_list":["😀"]}'`,
		RunE:    runE,
	}

	cmd.Flags().Int64("user-id", 0, "Sticker set owner ID")
	cmd.Flags().String("name", "", "Sticker set short name")
	cmd.Flags().String("sticker", "", "JSON object with sticker data")

	return cmd
}
