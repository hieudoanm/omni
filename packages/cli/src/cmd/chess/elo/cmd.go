package elo

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/elo/change"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/elo/diff"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/elo/expected"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/elo/required"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/elo/tournament"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/elo/tpr"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "elo",
		Short: "Elo rating calculators",
		Long:  `Elo rating utilities: expected scores, rating changes, performance ratings, and more.`,
		Example: `  chess elo expected-score --player-rating 1800 --opponent-rating 2000
  chess elo rating-change --player-rating 1800 --opponent-rating 2000 --result win --k-factor 20
  chess elo tournament --starting-rating 1800 --k-factor 20 --opponents "1900,1750,1850" --results "win,draw,loss"
  chess elo tpr --ratings "1800,1900,2000,2100" --score 3 --games 4
  chess elo required-score --avg-opponent-rating 2200 --games 9 --target-tpr 2400
  chess elo rating-diff --difference 200
  chess elo rating-diff --expected-score 0.75`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.AddCommand(expected.NewCmd())
	cmd.AddCommand(change.NewCmd())
	cmd.AddCommand(tournament.NewCmd())
	cmd.AddCommand(tpr.NewCmd())
	cmd.AddCommand(required.NewCmd())
	cmd.AddCommand(diff.NewCmd())

	return cmd
}
