package metadata

import (
	"fmt"
	"os"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	title, _ := cmd.Flags().GetString("title")
	author, _ := cmd.Flags().GetString("author")
	subject, _ := cmd.Flags().GetString("subject")
	keywords, _ := cmd.Flags().GetString("keywords")

	hasSet := title != "" || author != "" || subject != "" || keywords != ""

	f, err := os.Open(file)
	if err != nil {
		return fmt.Errorf("cannot open %s: %w", file, err)
	}
	defer f.Close()

	conf := api.LoadConfiguration()
	info, err := api.PDFInfo(f, file, nil, false, conf)
	if err != nil {
		return fmt.Errorf("cannot read metadata: %w", err)
	}

	if !hasSet {
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
		if info.Title == "" && info.Author == "" && info.Subject == "" && len(info.Keywords) == 0 {
			fmt.Fprintln(cmd.OutOrStdout(), "No metadata found")
		}
		return nil
	}

	props := make(map[string]string)
	if title != "" {
		props["Title"] = title
	}
	if author != "" {
		props["Author"] = author
	}
	if subject != "" {
		props["Subject"] = subject
	}
	if keywords != "" {
		props["Keywords"] = keywords
	}

	if err := api.AddPropertiesFile(file, file, props, conf); err != nil {
		return fmt.Errorf("metadata update failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Updated metadata for %s\n", file)
	return nil
}
