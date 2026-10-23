package bmi

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var weight, height float64

	cmd := &cobra.Command{
		Use:   "bmi",
		Short: "Calculate Body Mass Index",
		Long: `Calculate Body Mass Index (BMI) from weight and height.

BMI is calculated as weight (kg) divided by height (m) squared.
The result includes a weight category: Underweight, Normal, Overweight, or Obese.`,
		Example: `  calc bmi --weight 70 --height 175`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runBMI(weight, height, jsonOutput)
		},
	}

	cmd.Flags().Float64VarP(&weight, "weight", "w", 0, "Weight in kg")
	cmd.Flags().Float64VarP(&height, "height", "h", 0, "Height in cm")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
