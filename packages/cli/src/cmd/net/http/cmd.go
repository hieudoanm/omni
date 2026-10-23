package http

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var url, method, data, header string
	var httpJSON bool

	cmd := &cobra.Command{
		Use:   "http [--url <url>]",
		Short: "Make HTTP requests",
		Long:  `Make HTTP GET, POST, PUT, DELETE requests to URLs.`,
		Example: `  net http --url https://api.example.com/data
  net http --url https://api.example.com --method POST --data '{"key":"value"}'
  net http --url https://api.example.com/resource/1 --method DELETE
  net http --url https://api.example.com --header "Authorization: Bearer token"`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return httpRun(url, method, data, header, httpJSON)
		},
	}

	cmd.Flags().StringVarP(&url, "url", "u", "", "URL to request")
	cmd.Flags().StringVarP(&method, "method", "X", "GET", "HTTP method (GET, POST, PUT, DELETE)")
	cmd.Flags().StringVarP(&data, "data", "d", "", "Request body data")
	cmd.Flags().StringVarP(&header, "header", "H", "", "Request headers (key:val,key2:val2)")
	cmd.Flags().BoolVar(&httpJSON, "json", false, "Pretty-print JSON response")
	return cmd
}
