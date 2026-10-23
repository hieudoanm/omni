package info

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	f, err := os.Open(file)
	if err != nil {
		return fmt.Errorf("cannot open %s: %w", file, err)
	}
	defer f.Close()

	conf := api.LoadConfiguration()
	info, err := api.PDFInfo(f, file, nil, false, conf)
	if err != nil {
		return fmt.Errorf("cannot read info: %w", err)
	}

	stat, _ := os.Stat(file)
	fmt.Fprintf(cmd.OutOrStdout(), "File: %s\n", filepath.Base(file))
	fmt.Fprintf(cmd.OutOrStdout(), "Pages: %d\n", info.PageCount)
	fmt.Fprintf(cmd.OutOrStdout(), "Version: %s\n", info.Version)
	fmt.Fprintf(cmd.OutOrStdout(), "Encrypted: %t\n", info.Encrypted)
	if stat != nil {
		fmt.Fprintf(cmd.OutOrStdout(), "Size: %s\n", formatSize(stat.Size()))
	}
	if info.Title != "" {
		fmt.Fprintf(cmd.OutOrStdout(), "Title: %s\n", info.Title)
	}
	if info.Author != "" {
		fmt.Fprintf(cmd.OutOrStdout(), "Author: %s\n", info.Author)
	}
	if info.Subject != "" {
		fmt.Fprintf(cmd.OutOrStdout(), "Subject: %s\n", info.Subject)
	}
	if len(info.Keywords) > 0 {
		fmt.Fprintf(cmd.OutOrStdout(), "Keywords: %s\n", info.Keywords)
	}

	return nil
}

func formatSize(bytes int64) string {
	switch {
	case bytes > 1_000_000:
		return fmt.Sprintf("%.1f MB", float64(bytes)/1_000_000)
	case bytes > 1_000:
		return fmt.Sprintf("%.1f KB", float64(bytes)/1_000)
	default:
		return fmt.Sprintf("%d B", bytes)
	}
}
