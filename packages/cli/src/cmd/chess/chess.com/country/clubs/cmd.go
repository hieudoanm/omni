package clubs

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var code string
	cmd := &cobra.Command{
		Use:   "clubs",
		Short: "Show country clubs",
		Long:  `List clubs associated with a country.`,
		Example: `  chess com country clubs --code US
  chess com country clubs --code IT`,
		RunE: runCountryClubs,
	}
	cmd.Flags().StringVarP(&code, "code", "c", "", "ISO 3166-1 alpha-2 country code")
	return cmd
}
