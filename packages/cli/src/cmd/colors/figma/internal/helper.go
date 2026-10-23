package internal

import (
	"strings"

	"github.com/spf13/cobra"
)

func GetJSONFlag(cmd *cobra.Command) bool {
	for c := cmd; c != nil; c = c.Parent() {
		if f := c.Flag("json"); f != nil {
			v, _ := cmd.Flags().GetBool("json")
			if !v {
				v, _ = c.Flags().GetBool("json")
			}
			return v
		}
	}
	return false
}

func FlagOrArg(cmd *cobra.Command, args []string, name string) string {
	if f := cmd.Flag(name); f != nil && f.Changed {
		return strings.TrimSpace(f.Value.String())
	}
	if len(args) > 0 {
		return strings.TrimSpace(args[0])
	}
	return ""
}
