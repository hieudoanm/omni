package totp

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	var (
		secretStr string
		step      int
		digits    int
		timeStr   string
	)

	cmd := &cobra.Command{
		Use:   "totp [--secret <secret>]",
		Short: "Generate a TOTP code from a Base32 secret",
		Long: `Generate a Time-based One-Time Password (RFC 6238) from a Base32-encoded secret key.

Accepts secrets with or without padding. Compatible with Google Authenticator, Authy, and most 2FA apps.`,
		Example: `  crypto totp --secret JBSWY3DPEHPK3PXP
  crypto totp --secret JBSWY3DPEHPK3PXP --step 30 --digits 6
  crypto totp --secret JBSWY3DPEHPK3PXP --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runTOTP(secretStr, step, digits, timeStr, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&secretStr, "secret", "s", "", "Base32 secret")
	cmd.Flags().IntVar(&step, "step", 30, "Time step in seconds")
	cmd.Flags().IntVar(&digits, "digits", 6, "Number of digits (6 or 8)")
	cmd.Flags().StringVar(&timeStr, "time", "", "Time in RFC3339 format (for testing)")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
