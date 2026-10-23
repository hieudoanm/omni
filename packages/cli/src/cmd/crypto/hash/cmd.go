package hash

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var algorithm, text, key string
	var check, jsonOutput bool

	cmd := &cobra.Command{
		Use:   "hash",
		Short: "Compute hashes of text or files",
		Long:  `Compute MD5, SHA1, SHA256, or SHA512 hashes with optional HMAC support.`,
		Example: `  hash --text "hello world"
  hash --text "hello" --algo sha256 --key secret`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runHash(algorithm, text, key, check, jsonOutput, args)
		},
	}

	cmd.Flags().StringVarP(&algorithm, "algo", "a", "sha256", "Hash algorithm (md5, sha1, sha256, sha512)")
	cmd.Flags().StringVarP(&text, "text", "t", "", "Text to hash")
	cmd.Flags().StringVarP(&key, "key", "k", "", "HMAC key")
	cmd.Flags().BoolVar(&check, "check", false, "Verify file hash from 'hash filename' format")
	cmd.Flags().BoolVar(&jsonOutput, "json", false, "Output in JSON format")
	return cmd
}
