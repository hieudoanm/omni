package security

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/security/decrypt"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/security/encrypt"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "security",
		Short: "Encrypt and decrypt PDF files",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(encrypt.NewCommand())
	cmd.AddCommand(decrypt.NewCommand())
	return cmd
}
