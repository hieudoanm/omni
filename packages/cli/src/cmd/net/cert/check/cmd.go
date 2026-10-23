package check

import (
	"fmt"
	"time"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/net/cert/internal"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var host string
	var jsonOutput bool

	cmd := &cobra.Command{
		Use:   "check [--host <host:port>]",
		Short: "Quick certificate health check (expiry warning)",
		Long:  `Quickly check the TLS certificate for a host and report whether it is valid, expiring soon, or expired. Returns remaining validity time and SAN entries.`,
		Example: `  net cert check --host google.com:443
  cert check --host example.org --warn 30`,
		RunE: func(cmd *cobra.Command, args []string) error {
			conn, err := internal.CertDialFn(host)
			if err != nil {
				return err
			}
			defer conn.Close()

			state := conn.ConnectionState()
			if len(state.PeerCertificates) == 0 {
				return fmt.Errorf("no certificates returned")
			}

			leaf := state.PeerCertificates[0]
			remaining := leaf.NotAfter.Sub(time.Now())

			if jsonOutput {
				internal.PrintJSON(internal.BuildCertCheck(host, remaining, leaf.DNSNames))
				return nil
			}
			internal.PrintCertCheck(internal.BuildCertCheck(host, remaining, leaf.DNSNames))
			return nil
		},
	}

	cmd.Flags().StringVarP(&host, "host", "H", "", "Host:port to check")
	cmd.Flags().BoolVar(&jsonOutput, "json", false, "Output in JSON format")
	return cmd
}
