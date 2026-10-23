package ref

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "ref [doi]",
		Short: "Generate a formatted reference from a DOI",
		Long:  `Fetches metadata for a given DOI from Crossref and generates a formatted reference entry.`,
		Example: `  doi ref 10.1000/xyz123
  doi ref 10.1038/nature12373`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runRef(cmd, args)
		},
	}
}
