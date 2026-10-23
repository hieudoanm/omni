package profile

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var clubID string
	cmd := &cobra.Command{
		Use:   "profile",
		Short: "Show club profile",
		Long:  `Fetch and display a Chess.com club's profile information.`,
		Example: `  chess com club profile --club chess-com-developer-community
  chess com club profile --club team-usa-southwest`,
		RunE: runClubProfile,
	}
	cmd.Flags().StringVarP(&clubID, "club", "c", "", "Club URL ID")
	return cmd
}
