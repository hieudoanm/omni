package obsidian

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var (
		obsidianDir     string
		obsidianOut     string
		obsidianFormat  string
		obsidianExclude string
	)

	cmd := &cobra.Command{
		Use:   "obsidian",
		Short: "Build a wiki-link graph from markdown files",
		Long: `Walk a directory tree of markdown files, extract [[wiki-link]] references,
and output a graph of how files interconnect.

Formats:
  dot     - Graphviz DOT format (default)
  json    - JSON object with nodes[] and edges[]
  edges   - Plain text edge list`,
		Example: `  docsify obsidian --dir . --format dot --out graph.dot
  docsify obsidian --dir /path/to/vault --format json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runObsidian(obsidianDir, obsidianOut, obsidianFormat, obsidianExclude)
		},
	}

	cmd.Flags().StringVar(&obsidianDir, "dir", ".", "Root directory to scan")
	cmd.Flags().StringVar(&obsidianOut, "out", "", "Output file path (default: stdout)")
	cmd.Flags().StringVar(&obsidianFormat, "format", "dot", "Output format: dot, json, edges")
	cmd.Flags().StringVar(&obsidianExclude, "exclude", ".git,node_modules,vendor,dist,.next,__pycache__", "Comma-separated directories to exclude")

	return cmd
}
