package unit

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var value float64
	var from, to string

	cmd := &cobra.Command{
		Use:   "unit",
		Short: "Convert between units (length, weight, temp, speed)",
		Long:  `Convert values between different units of measurement.`,
		Example: `  calc unit --value 12 --from inch --to cm
  calc unit -v 32 -f f -t c
  calc unit -v 100 -f kg -t lb`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runUnit(value, from, to, jsonOutput)
		},
	}

	cmd.Flags().Float64VarP(&value, "value", "v", 0, "Value to convert")
	cmd.Flags().StringVarP(&from, "from", "f", "", "Source unit")
	cmd.Flags().StringVarP(&to, "to", "t", "", "Target unit")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
