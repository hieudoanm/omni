package ip

import (
	"fmt"
	"os"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/net/ip/dns"
	"github.com/spf13/cobra"
)

var (
	ipRawFlag bool
	ipJSON    bool
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "ip",
		Short: "Look up your public IP and geolocation",
		Long:  `Look up your public IP address and geolocation information from multiple providers.`,
		Example: `  net ip
  net ip --json
  net ip --raw`,
		RunE: func(cmd *cobra.Command, args []string) error {
			ip, err := fetchPublicIP()
			if err != nil {
				return err
			}

			info, err := fetchFromIPInfo(ip)
			if err != nil {
				fmt.Fprintf(os.Stderr, "IPinfo failed (%v), falling back to ipapi...\n", err)
				info, err = fetchFromIpapi(ip)
				if err != nil {
					return fmt.Errorf("both providers failed: %w", err)
				}
				printIPInfo(info, "ipapi", ipRawFlag || ipJSON)
				return nil
			}

			printIPInfo(info, "IPinfo", ipRawFlag || ipJSON)
			return nil
		},
	}

	cmd.Flags().BoolVarP(&ipRawFlag, "raw", "r", false, "Output raw JSON")
	cmd.Flags().BoolVar(&ipJSON, "json", false, "Output in JSON format")
	cmd.AddCommand(dns.NewCmd())
	return cmd
}
