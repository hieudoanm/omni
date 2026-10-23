package status

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cobra"
)

var (
	statusDebug bool
	statusJSON  bool
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "status",
		Short: "Check the uptime status of cloud services",
		Long:  `Check and display the current operational status of various cloud services including Atlassian, GitHub, Vercel, and more.`,
		Example: `  net status
  net status --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			type svcResult struct {
				Name   string
				Status string
			}

			var results []svcResult
			for _, servicesByGroup := range Services {
				for name, url := range servicesByGroup {
					out := GetDescriptiveStatus(name, url, statusDebug)
					results = append(results, svcResult{Name: name, Status: out})
				}
			}

			if statusJSON {
				b, _ := json.MarshalIndent(results, "", "  ")
				fmt.Println(string(b))
				return nil
			}

			maxName := 0
			for _, r := range results {
				if len(r.Name) > maxName {
					maxName = len(r.Name)
				}
			}

			for _, r := range results {
				status := strings.ToLower(r.Status)
				switch {
				case strings.Contains(status, "healthy"),
					strings.Contains(status, "up"),
					strings.Contains(status, "ok"):
					fmt.Printf("  %s  %-*s  %s\n", "\033[32m●\033[0m", maxName, r.Name, r.Status)
				case strings.Contains(status, "down"),
					strings.Contains(status, "error"),
					strings.Contains(status, "fail"):
					fmt.Printf("  %s  %-*s  %s\n", "\033[31m●\033[0m", maxName, r.Name, r.Status)
				default:
					fmt.Printf("  %s  %-*s  %s\n", "\033[33m●\033[0m", maxName, r.Name, r.Status)
				}
			}
			fmt.Printf("\n  %d services checked\n", len(results))

			return nil
		},
	}

	cmd.Flags().BoolVarP(&statusDebug, "debug", "d", false, "Enable debug logging")
	cmd.Flags().BoolVar(&statusJSON, "json", false, "Output in JSON format")
	return cmd
}
