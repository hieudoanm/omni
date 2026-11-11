package members

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var clubID string
	cmd := &cobra.Command{
		Use:   "members",
		Short: "Show club members",
		Long:  `List club members grouped by activity level.`,
		Example: `  chess com club members --club chess-com-developer-community
  chess com club members --club team-usa-southwest`,
		RunE: runClubMembers,
	}
	cmd.Flags().StringVarP(&clubID, "club", "c", "", "Club URL ID")
	return cmd
}
