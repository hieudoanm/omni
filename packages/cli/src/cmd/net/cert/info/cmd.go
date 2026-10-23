package info

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/net/cert/internal"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var host string
	var jsonOutput bool

	cmd := &cobra.Command{
		Use:   "info [--host <host:port>]",
		Short: "Show detailed certificate information",
		Long:  `Retrieve and display the full certificate chain for a TLS endpoint.`,
		Example: `  cert info --host google.com:443
  cert info --host example.org:8443`,
		RunE: func(cmd *cobra.Command, args []string) error {
			conn, err := internal.CertDialFn(host)
			if err != nil {
				return err
			}
			defer conn.Close()

			certs := internal.FormatCerts(conn.ConnectionState().PeerCertificates)
			if jsonOutput {
				internal.PrintJSON(certs)
				return nil
			}
			internal.PrintCertInfo(certs)
			return nil
		},
	}

	cmd.Flags().StringVarP(&host, "host", "H", "", "Host:port to inspect")
	cmd.Flags().BoolVar(&jsonOutput, "json", false, "Output in JSON format")
	return cmd
}
