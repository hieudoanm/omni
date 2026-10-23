package serve

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/hieudoanm/omni/packages/cli/src/libs/mcp"
	"github.com/spf13/cobra"
)

func runServe(rootCmd *cobra.Command) error {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()
	server := mcp.NewServer()
	registerTools(server, rootCmd)
	return server.RunWithContext(ctx)
}
