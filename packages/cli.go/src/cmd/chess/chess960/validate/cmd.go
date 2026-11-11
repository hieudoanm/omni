package validate

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "validate <position>",
		Short: "Validate a Chess960 starting position",
		Long:  `Validate whether a position string (e.g., BBNNQRKR) is a legal Chess960 starting position according to the rules: one king, one queen, two rooks, two bishops, two knights; bishops on opposite colors; king between rooks.`,
		Example: `  chess chess960 validate BBNNQRKR
  chess chess960 validate RNBQKBNR`,
		Args: cobra.ExactArgs(1),
		RunE: runValidate,
	}
}
