package keygen

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	var algorithm string
	var bits int
	var output string

	cmd := &cobra.Command{
		Use:   "keygen",
		Short: "Generate a new SSH keypair",
		Long: `Generate an SSH keypair (RSA, ECDSA, or Ed25519).

Writes two files: <name> (private key) and <name>.pub (public key).
Private key is saved in PEM format with 0600 permissions.`,
		Example: `  crypto keygen --algo ed25519 -o id_ed25519
  crypto keygen --algo rsa --bits 4096 -o id_rsa
  crypto keygen --algo ecdsa --bits 256 -o id_ecdsa`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runKeygen(algorithm, bits, output, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&algorithm, "algo", "a", "ed25519", "Key algorithm (rsa, ecdsa, ed25519)")
	cmd.Flags().IntVarP(&bits, "bits", "b", 256, "Key size (bits): 2048/4096 for rsa, 256/384/521 for ecdsa")
	cmd.Flags().StringVarP(&output, "output", "o", "id_rsa", "Output file path")
	return cmd
}
