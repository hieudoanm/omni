package ping

import (
	"time"

	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var host string
	var port int
	var count int
	var timeout time.Duration

	cmd := &cobra.Command{
		Use:   "ping [--host <host>]",
		Short: "TCP ping to check host reachability",
		Long:  `Test TCP connectivity to a host with timing statistics. Uses TCP dial (not ICMP).`,
		Example: `  net ping --host example.com
  net ping --host example.com --port 443
  net ping --host example.com --count 5
  net ping --host google.com --port 443 --count 3 --timeout 2s`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return pingRun(host, port, count, timeout)
		},
	}

	cmd.Flags().StringVarP(&host, "host", "H", "", "Host to ping")
	cmd.Flags().IntVarP(&port, "port", "p", 80, "TCP port")
	cmd.Flags().IntVarP(&count, "count", "c", 4, "Number of pings")
	cmd.Flags().DurationVarP(&timeout, "timeout", "t", 5*time.Second, "Per-ping timeout")
	cmd.Flags().BoolVar(&pingJSON, "json", false, "Output in JSON format")
	return cmd
}
