package serve

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var port int
	var dir, certFile, keyFile string
	var cors, serveJSON bool

	cmd := &cobra.Command{
		Use:   "serve",
		Short: "Start an HTTP file server",
		Long:  `Serve static files over HTTP with optional CORS, directory listing, and TLS support.`,
		Example: `  serve
  serve --port 9000 --dir ./public
  serve --port 443 --cert cert.pem --key key.pem`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return serveRun(port, dir, certFile, keyFile, cors, serveJSON)
		},
	}

	cmd.Flags().IntVarP(&port, "port", "p", 8080, "Port to listen on")
	cmd.Flags().StringVarP(&dir, "dir", "d", ".", "Directory to serve")
	cmd.Flags().BoolVar(&cors, "cors", false, "Enable CORS headers")
	cmd.Flags().StringVar(&certFile, "cert", "", "TLS certificate file")
	cmd.Flags().StringVar(&keyFile, "key", "", "TLS key file")
	cmd.Flags().BoolVar(&serveJSON, "json", false, "Output in JSON format")
	return cmd
}
