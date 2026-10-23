package passwd

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	var length, count int
	var digits, symbols, noUpper, pin, clip, pronounceable bool

	cmd := &cobra.Command{
		Use:   "passwd",
		Short: "Generate secure random passwords",
		Long:  `Generate random passwords with configurable length, character sets, and pronounceable options.`,
		Example: `  passwd
  passwd --length 32 --symbols
  passwd --pin --count 5
  passwd --pronounceable`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runPasswd(length, count, digits, symbols, noUpper, pin, clip, pronounceable, jsonOutput)
		},
	}

	cmd.Flags().IntVarP(&length, "length", "l", 16, "Password length")
	cmd.Flags().IntVarP(&count, "count", "n", 1, "Number of passwords")
	cmd.Flags().BoolVarP(&digits, "digits", "d", true, "Include digits")
	cmd.Flags().BoolVarP(&symbols, "symbols", "s", false, "Include symbols")
	cmd.Flags().BoolVar(&noUpper, "no-upper", false, "Exclude uppercase letters")
	cmd.Flags().BoolVar(&pin, "pin", false, "Generate numeric PIN")
	cmd.Flags().BoolVar(&clip, "clip", false, "Copy to clipboard (first password only)")
	cmd.Flags().BoolVar(&pronounceable, "pronounceable", false, "Generate pronounceable password")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
