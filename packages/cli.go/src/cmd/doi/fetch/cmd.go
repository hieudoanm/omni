package fetch

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "fetch [doi]",
		Short: "Fetch raw metadata for a DOI",
		Long:  `Fetches metadata for a given DOI from Crossref and displays the raw JSON response.`,
		Example: `  doi fetch 10.1000/xyz123
  doi fetch 10.1038/nature12373`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runFetch(cmd, args)
		},
	}
}
