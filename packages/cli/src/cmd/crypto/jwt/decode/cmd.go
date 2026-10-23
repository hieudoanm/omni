package decode

import "github.com/spf13/cobra"

func NewCmd() *cobra.Command {
	var token string

	cmd := &cobra.Command{
		Use:   "decode [--token <token>]",
		Short: "Decode a JWT token without signature verification",
		Long:  `Decode a JWT token to inspect its header and payload claims without verifying the signature. Supports JSON output.`,
		Example: `  crypto jwt decode --token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.abc
  crypto jwt decode --token eyJhbGci... --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runDecode(token, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&token, "token", "t", "", "JWT token to decode")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
