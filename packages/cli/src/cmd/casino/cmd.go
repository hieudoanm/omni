package casino

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/baccarat"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/blackjack"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/coin"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/dice"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/poker"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/roulette"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/slots"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "casino",
		Short: "Casino games: blackjack, poker odds, and more",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(
		blackjack.NewCmd(),
		poker.NewCmd(),
		baccarat.NewCmd(),
		slots.NewCmd(),
		coin.NewCmd(),
		dice.NewCmd(),
		roulette.NewCmd(),
	)
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
