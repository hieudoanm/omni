package user

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/user/activity"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/user/perf"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/user/profile"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/user/rating"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/user/status"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "user",
		Short: "User information and stats",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(profile.NewCmd())
	cmd.AddCommand(status.NewCmd())
	cmd.AddCommand(activity.NewCmd())
	cmd.AddCommand(rating.NewCmd())
	cmd.AddCommand(perf.NewCmd())
	return cmd
}
