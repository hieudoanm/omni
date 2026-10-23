package base

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var value string
	var from, to string

	cmd := &cobra.Command{
		Use:   "base",
		Short: "Convert between number bases (bin/oct/dec/hex)",
		Long: `Convert numbers between different bases (binary, octal, decimal, hexadecimal).

Supports standard prefixes and aliases for each base.
Results can be output in JSON format with --json.`,
		Example: `  calc base --value FF --from hex --to dec
  calc base --value 255 --from dec --to hex
  calc base --value 1010 --from bin --to dec`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runBase(value, from, to, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&value, "value", "v", "", "Value to convert")
	cmd.Flags().StringVarP(&from, "from", "f", "dec", "Source base (bin/oct/dec/hex)")
	cmd.Flags().StringVarP(&to, "to", "t", "hex", "Target base (bin/oct/dec/hex)")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
