package checksum

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var algorithm, filePath string
	cmd := &cobra.Command{
		Use:   "checksum [--file <path>]",
		Short: "Compute file checksum",
		Long:  `Compute a cryptographic hash of a file. Supports md5, sha1, sha256 (default), and sha512.`,
		Example: `  file checksum --file document.pdf
  file checksum --algorithm sha256 --file document.pdf
  file checksum -f document.pdf --algorithm sha256`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runChecksum(filePath, algorithm, jsonOutput)
		},
	}
	cmd.Flags().StringVarP(&algorithm, "algorithm", "a", "sha256", "Hash algorithm: md5, sha1, sha256, sha512")
	cmd.Flags().StringVarP(&filePath, "file", "f", "", "File path")
	return cmd
}
