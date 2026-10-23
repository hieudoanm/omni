package chess960

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess960/random"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess960/validate"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "chess960",
		Short: "Chess960 (Fischer Random) tools",
		Long:  `Generate, validate, and analyze Chess960 starting positions.`,
		Example: `  chess chess960 random
  chess chess960 validate BBNNQRKR`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.AddCommand(random.NewCmd())
	cmd.AddCommand(validate.NewCmd())

	return cmd
}
