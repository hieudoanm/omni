package csv

import (
	"encoding/csv"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"golang.org/x/net/html"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/simplify/internal"
)

func parseTables(htmlContent string) ([][][]string, error) {
	doc, err := html.Parse(strings.NewReader(htmlContent))
	if err != nil {
		return nil, fmt.Errorf("parse html: %w", err)
	}

	var tables [][][]string
	var walk func(*html.Node)
	walk = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "table" && n.Parent != nil {
			table := parseTable(n)
			if len(table) > 0 {
				tables = append(tables, table)
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(doc)

	return tables, nil
}

func parseTable(n *html.Node) [][]string {
	var rows [][]string
	rowTags := map[string]bool{"tr": true, "thead": true, "tbody": true, "tfoot": true}
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if c.Type == html.ElementNode {
			if c.Data == "tr" {
				rows = append(rows, parseRow(c))
			} else if rowTags[c.Data] {
				for r := c.FirstChild; r != nil; r = r.NextSibling {
					if r.Type == html.ElementNode && r.Data == "tr" {
						rows = append(rows, parseRow(r))
					}
				}
			}
		}
	}
	return rows
}

func parseRow(n *html.Node) []string {
	var row []string
	for cell := n.FirstChild; cell != nil; cell = cell.NextSibling {
		if cell.Type == html.ElementNode && (cell.Data == "td" || cell.Data == "th") {
			row = append(row, extractText(cell))
		}
	}
	return row
}

func extractText(n *html.Node) string {
	var buf strings.Builder
	var gather func(*html.Node)
	gather = func(node *html.Node) {
		if node.Type == html.TextNode {
			buf.WriteString(node.Data)
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			gather(c)
		}
	}
	gather(n)
	return strings.TrimSpace(buf.String())
}

func tablesToCSVFiles(tables [][][]string, pageURL, outDir string) ([]string, error) {
	host := internal.ExtractHost(pageURL)
	var paths []string

	for i, table := range tables {
		if len(table) == 0 {
			continue
		}
		filename := host + ".csv"
		if len(tables) > 1 {
			filename = fmt.Sprintf("%s-table-%d.csv", host, i)
		}
		filePath := filepath.Join(outDir, filename)

		f, err := os.Create(filePath)
		if err != nil {
			return nil, fmt.Errorf("create %s: %w", filePath, err)
		}

		w := csv.NewWriter(f)
		for _, row := range table {
			if err := w.Write(row); err != nil {
				f.Close()
				return nil, fmt.Errorf("write csv: %w", err)
			}
		}
		w.Flush()
		if err := w.Error(); err != nil {
			f.Close()
			return nil, fmt.Errorf("flush csv: %w", err)
		}
		f.Close()

		absPath, _ := filepath.Abs(filePath)
		paths = append(paths, absPath)
	}

	return paths, nil
}
