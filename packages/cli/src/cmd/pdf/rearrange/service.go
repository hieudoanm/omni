package rearrange

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

func run(cmd *cobra.Command, file string) error {
	order, _ := cmd.Flags().GetString("order")
	output, _ := cmd.Flags().GetString("output")

	if order == "" {
		return fmt.Errorf("--order is required")
	}

	if output == "" {
		ext := filepath.Ext(file)
		base := strings.TrimSuffix(file, ext)
		output = base + ".reordered.pdf"
	}

	conf := api.LoadConfiguration()

	ctx, err := api.ReadContextFile(file)
	if err != nil {
		return fmt.Errorf("cannot read PDF: %w", err)
	}

	totalPages := ctx.PageCount

	var pageOrder []int
	if order == "reverse" {
		for i := totalPages; i >= 1; i-- {
			pageOrder = append(pageOrder, i)
		}
	} else {
		parts := strings.Split(order, ",")
		for _, p := range parts {
			p = strings.TrimSpace(p)
			n, err := strconv.Atoi(p)
			if err != nil || n < 1 || n > totalPages {
				return fmt.Errorf("invalid page number: %s", p)
			}
			pageOrder = append(pageOrder, n)
		}
	}

	tmpDir, err := os.MkdirTemp("", "pdfrearrange")
	if err != nil {
		return fmt.Errorf("cannot create temp dir: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	var extracted []string
	for i, p := range pageOrder {
		pageStr := strconv.Itoa(p)
		outFile := filepath.Join(tmpDir, fmt.Sprintf("page_%d.pdf", i))
		if err := api.ExtractPagesFile(file, tmpDir, []string{pageStr}, conf); err != nil {
			return fmt.Errorf("cannot extract page %d: %w", p, err)
		}
		// ExtractPagesFile creates files like <tmpDir>/<file>_<pageNr>.pdf
		baseName := strings.TrimSuffix(filepath.Base(file), filepath.Ext(file))
		extractedFile := filepath.Join(tmpDir, fmt.Sprintf("%s_%s.pdf", baseName, pageStr))
		if _, err := os.Stat(extractedFile); err == nil {
			os.Rename(extractedFile, outFile)
			extracted = append(extracted, outFile)
		}
	}

	f, err := os.Create(output)
	if err != nil {
		return fmt.Errorf("cannot create %s: %w", output, err)
	}
	defer f.Close()

	if err := api.Merge(output, extracted, f, conf, false); err != nil {
		return fmt.Errorf("merge failed: %w", err)
	}
	fmt.Fprintf(cmd.OutOrStdout(), "Rearranged pages into %s\n", output)
	return nil
}
