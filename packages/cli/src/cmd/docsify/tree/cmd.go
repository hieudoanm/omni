package tree

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var (
		treeDir     string
		treeOut     string
		ignoreDirs  []string
		ignoreFiles []string
	)

	cmd := &cobra.Command{
		Use:   "tree",
		Short: "Generate directory tree as Markdown",
		Long:  `Walk the directory tree and write the structure to TREE.md, respecting .gitignore patterns.`,
		Example: `  docsify tree --dir . --out TREE.md
  docsify tree --dir /path/to/project --ignore-dir node_modules --ignore-dir dist --ignore-file .env`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runTree(treeDir, treeOut, ignoreDirs, ignoreFiles)
		},
	}

	cmd.Flags().StringVar(&treeDir, "dir", ".", "Root directory to tree")
	cmd.Flags().StringVar(&treeOut, "out", "TREE.md", "Output file path")
	cmd.Flags().StringSliceVar(&ignoreDirs, "ignore-dir", nil, "Skip directories with this exact name (repeatable)")
	cmd.Flags().StringSliceVar(&ignoreFiles, "ignore-file", nil, "Skip files with this exact name (repeatable)")

	return cmd
}
