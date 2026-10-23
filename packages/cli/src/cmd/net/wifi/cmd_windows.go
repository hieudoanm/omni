//go:build windows

package wifi

import (
	"fmt"

	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "wifi",
		Short: "List nearby Wi-Fi networks",
		Long:  "Wi-Fi scanning is not supported on Windows.",
		RunE: func(cmd *cobra.Command, args []string) error {
			return fmt.Errorf("wifi scanning is not supported on windows")
		},
	}
}
