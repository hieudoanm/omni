package dns

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var domain string
	var recordType string

	cmd := &cobra.Command{
		Use:   "dns [--domain <domain>]",
		Short: "DNS record lookup",
		Long:  `Look up DNS records (A, AAAA, CNAME, MX, NS, TXT) for a domain. Defaults to all record types.`,
		Example: `  net dns --domain example.com
  net dns --domain example.com --type mx
  net dns --domain example.com --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return dnsRun(domain, recordType)
		},
	}

	cmd.Flags().StringVarP(&domain, "domain", "d", "", "Domain to look up")
	cmd.Flags().StringVarP(&recordType, "type", "t", "", "Record type (a, aaaa, cname, mx, ns, txt)")
	cmd.Flags().BoolVar(&dnsJSON, "json", false, "Output in JSON format")
	return cmd
}
