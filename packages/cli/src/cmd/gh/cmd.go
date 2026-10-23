package gh

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/coc"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/ignore"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/languages"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/license"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/og"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "gh",
		Short: "GitHub CLI tools",
		Long:  `GitHub CLI utilities for interacting with GitHub APIs.`,
		Example: `  gh languages --repo hieudoanm/hieudoanm.github.io
  gh license
  gh coc
  gh ignore
  gh og --url hieudoanm/hieudoanm.github.io`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")

	cmd.AddCommand(coc.NewCommand())
	cmd.AddCommand(ignore.NewCommand())
	cmd.AddCommand(languages.NewCommand())
	cmd.AddCommand(license.NewCommand())
	cmd.AddCommand(og.NewCommand())

	return cmd
}
