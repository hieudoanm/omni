package profile

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var code string
	cmd := &cobra.Command{
		Use:   "profile",
		Short: "Show country profile",
		Long:  `Fetch and display a country's profile information.`,
		Example: `  chess com country profile --code US
  chess com country profile --code IT`,
		RunE: runCountryProfile,
	}
	cmd.Flags().StringVarP(&code, "code", "c", "", "ISO 3166-1 alpha-2 country code")
	return cmd
}
