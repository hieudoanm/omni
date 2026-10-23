package serve

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var servePort string

	cmd := &cobra.Command{
		Use:   "serve",
		Short: "Start the OpenRouter HTTP server",
		Long: `Starts a lightweight Go HTTP server that exposes:
  GET  /       - health check
  POST /chat   - forward {prompt, model} to OpenRouter and return the response`,
		Example: `  openrouter serve
  openrouter serve -p 8080`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runServe(servePort)
		},
	}

	cmd.Flags().StringVarP(&servePort, "port", "p", "8080", "Port to listen on")
	return cmd
}
