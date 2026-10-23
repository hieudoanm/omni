package cert

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/net/cert/check"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/net/cert/info"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "cert",
		Short: "SSL/TLS certificate inspection",
		Long:  `Inspect SSL/TLS certificates for domains: check expiry, issuer, SANs, and chain.`,
		Example: `  net cert info --host google.com:443
  net cert check --host google.com:443`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(info.NewCmd())
	cmd.AddCommand(check.NewCmd())
	return cmd
}
