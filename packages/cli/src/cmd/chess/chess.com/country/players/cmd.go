package players

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var code string
	cmd := &cobra.Command{
		Use:   "players",
		Short: "Show country players",
		Long:  `List recently active players from a country.`,
		Example: `  chess com country players --code US
  chess com country players --code IT`,
		RunE: runCountryPlayers,
	}
	cmd.Flags().StringVarP(&code, "code", "c", "", "ISO 3166-1 alpha-2 country code")
	return cmd
}
