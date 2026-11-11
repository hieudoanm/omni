package cron

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "cron [--expression <expression>]",
		Short: "Describe a cron expression in plain English and compute next runs",
		Long:  `Parse a 5-field cron expression, describe when it runs, and compute upcoming occurences.`,
		Example: `  cron --expression "*/15 * * * *"
  cron --expression "0 9 * * 1-5"
  cron --expression "0 0 1 1 *"
  cron --next 5 --expression "*/30 * * * *"
  cron --next 10 --until "2026-12-31" --expression "0 0 * * *"`,
		RunE: func(cmd *cobra.Command, args []string) error {
			expression, _ := cmd.Flags().GetString("expression")
			next, _ := cmd.Flags().GetInt("next")
			until, _ := cmd.Flags().GetString("until")
			cronJSON, _ := cmd.Flags().GetBool("json")
			return runCron(expression, next, until, cronJSON)
		},
	}
	cmd.Flags().StringP("expression", "e", "", "Cron expression")
	cmd.Flags().IntP("next", "n", 0, "Show next N run times")
	cmd.Flags().String("until", "", "Show runs until this date (YYYY-MM-DD)")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
