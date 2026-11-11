package set_title

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "set-title",
		Short:   "Set sticker set title",
		Long:    `Set the title of a created sticker set.`,
		Example: `  telegram sticker set-title --name "my_set" --title "New Title"`,
		RunE:    runE,
	}

	cmd.Flags().String("name", "", "Sticker set short name")
	cmd.Flags().String("title", "", "New sticker set title")

	return cmd
}
