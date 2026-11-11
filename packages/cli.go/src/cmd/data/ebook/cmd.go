package ebook

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var format string
	var output string

	cmd := &cobra.Command{
		Use:   "ebook <file>",
		Short: "Convert e-book formats using calibre or pandoc",
		Long:  `Convert e-books between formats (epub, mobi, azw3) using ebook-convert from calibre.`,
		Example: `  data ebook book.epub --format mobi
  data ebook book.mobi --format epub -o book.epub`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runE(args[0], format, output)
		},
	}

	cmd.Flags().StringVar(&format, "format", "epub", "Output format (epub, mobi, azw3)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")

	return cmd
}
