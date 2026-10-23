package docsify

import (
	docsifycobra "github.com/hieudoanm/omni/packages/cli/src/cmd/docsify/cobra"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/docsify/obsidian"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/docsify/scan"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/docsify/tree"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "docsify",
		Short: "Codebase documentation and analysis tools",
		Long:  `Generate documentation from Cobra CLI projects, scan codebases for symbols and call graphs, build wiki-link graphs from markdown files, and produce directory trees.`,
		Example: `  docsify cobra --file /path/to/project
  docsify scan --dir . --out graph.graphml
  docsify tree --dir . --out TREE.md`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	cmd.AddCommand(docsifycobra.NewCmd())
	cmd.AddCommand(obsidian.NewCmd())
	cmd.AddCommand(scan.NewCmd())
	cmd.AddCommand(tree.NewCmd())

	return cmd
}
