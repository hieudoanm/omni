package palette

import (
	"github.com/spf13/cobra"
)

func newCmd() *cobra.Command {
	var style string
	cmd := &cobra.Command{
		Use:     "palette",
		Short:   "Generate a color palette from a base HEX color",
		Long:    `Generate a 3-color palette (base, support, accent) from a base HEX color using triadic, complementary, or analogous harmony.`,
		Example: `  colors palette --style triadic`,
		RunE:    runPalette,
	}
	cmd.Flags().StringVarP(&style, "style", "s", "", `palette style: "Balanced professional (Triadic)", "High-contrast (Complementary)", "Soft aesthetic (Analogous)"`)
	return cmd
}

func NewCmd() *cobra.Command {
	return newCmd()
}
