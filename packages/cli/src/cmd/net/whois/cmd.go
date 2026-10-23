package whois

import (
	"bufio"
	"fmt"
	"net"
	"strings"
	"time"

	"github.com/spf13/cobra"
)

var netDialTimeout = net.DialTimeout

func NewCmd() *cobra.Command {
	var domain string
	var server string

	cmd := &cobra.Command{
		Use:   "whois [--domain <domain>]",
		Short: "WHOIS lookup for a domain",
		Long:  `Query WHOIS servers for domain registration information.`,
		Example: `  net whois --domain example.com
  net whois --domain google.com
  net whois --domain example.com --server whois.verisign-grs.com`,
		RunE: func(cmd *cobra.Command, args []string) error {
			domain = strings.TrimSpace(domain)
			whoisServer := server
			if whoisServer == "" {
				whoisServer = whoisLookupServer(domain)
			}

			conn, err := netDialTimeout("tcp", net.JoinHostPort(whoisServer, "43"), 10*time.Second)
			if err != nil {
				return fmt.Errorf("connect to %s: %w", whoisServer, err)
			}
			defer conn.Close()

			conn.SetDeadline(time.Now().Add(10 * time.Second))
			fmt.Fprintf(conn, "%s\r\n", domain)

			sc := bufio.NewScanner(conn)
			sc.Buffer(make([]byte, 64*1024), 512*1024)
			var lines []string
			for sc.Scan() {
				lines = append(lines, sc.Text())
			}
			if err := sc.Err(); err != nil {
				return fmt.Errorf("read: %w", err)
			}

			fmt.Println(strings.Join(lines, "\n"))
			return nil
		},
	}

	cmd.Flags().StringVarP(&domain, "domain", "d", "", "Domain to look up")
	cmd.Flags().StringVarP(&server, "server", "s", "", "WHOIS server to query")
	return cmd
}
