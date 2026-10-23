package matches

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var clubID string
	cmd := &cobra.Command{
		Use:   "matches",
		Short: "Show club matches",
		Long:  `List team matches for a club.`,
		Example: `  chess com club matches --club team-usa-southwest
  chess com club matches --club chess-com-developer-community`,
		RunE: runClubMatches,
	}
	cmd.Flags().StringVarP(&clubID, "club", "c", "", "Club URL ID")
	return cmd
}
