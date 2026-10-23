package encode

import "github.com/spf13/cobra"

func NewCmd() *cobra.Command {
	var algorithm, key string
	var claimsJSON string

	cmd := &cobra.Command{
		Use:   "encode",
		Short: "Encode and sign a JWT token",
		Long:  `Create a signed JWT token with custom claims and signing method.`,
		Example: `  jwt encode --key secret --claims '{"sub":"123","name":"John"}'
  jwt encode --key secret --claims '{"sub":"123"}' --algorithm HS256`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runEncode(algorithm, key, claimsJSON, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&algorithm, "algorithm", "a", "HS256", "Signing algorithm (HS256, HS384, HS512)")
	cmd.Flags().StringVarP(&key, "key", "k", "", "Signing key (secret)")
	cmd.Flags().StringVarP(&claimsJSON, "claims", "c", "", "Claims as JSON string")
	cmd.MarkFlagRequired("key")
	cmd.MarkFlagRequired("claims")
	return cmd
}
