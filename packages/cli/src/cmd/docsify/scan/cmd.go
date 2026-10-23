package scan

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var (
		dir     string
		out     string
		exclude string
		verbose bool
	)

	cmd := &cobra.Command{
		Use:   "scan",
		Short: "Scan a codebase and generate a GraphML file",
		Long:  `Walk a codebase directory, extract symbols (functions, types, classes) and call edges from Go, TypeScript, Python, and Rust source files, and write the result as a GraphML file.`,
		Example: `  docsify scan --dir . --out graph.graphml
  docsify scan --dir /path/to/project --verbose`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runScan(dir, out, exclude, verbose)
		},
	}

	cmd.Flags().StringVar(&dir, "dir", ".", "Root directory to scan")
	cmd.Flags().StringVar(&out, "out", "codebase.graphml", "Output .graphml file path")
	cmd.Flags().StringVar(&exclude, "exclude", ".git,node_modules,vendor,dist,.next,__pycache__", "Comma-separated directories to exclude")
	cmd.Flags().BoolVar(&verbose, "verbose", false, "Print progress to stderr")

	return cmd
}
