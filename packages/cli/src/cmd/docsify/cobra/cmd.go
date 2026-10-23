package cobra

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var file string

	cmd := &cobra.Command{
		Use:   "cobra [--file <path>]",
		Short: "Generate README.md documentation from a Cobra CLI project",
		Long:  `docsify cobra scans Go source files for &cobra.Command{} definitions and generates a single README.md documenting all commands, subcommands, flags, and usage.`,
		Example: `  docsify cobra --file /path/to/project
  docsify cobra -f . -o README.md`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runCobraDoc(file, cmd)
		},
	}

	cmd.CompletionOptions.DisableDefaultCmd = true
	cmd.Flags().StringVarP(&file, "file", "f", "", "Path to cobra project directory (default: current directory)")
	cmd.Flags().StringP("output", "o", "README.md", "Output file path")

	return cmd
}
