package set_keywords

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "set-keywords",
		Short:   "Set sticker keywords",
		Long:    `Change the search keywords for a sticker.`,
		Example: `  telegram sticker set-keywords --sticker FILE_ID --keywords '["keyword1","keyword2"]'`,
		RunE:    runE,
	}

	cmd.Flags().String("sticker", "", "File ID of the sticker")
	cmd.Flags().String("keywords", "", "JSON array of keyword strings")

	return cmd
}
