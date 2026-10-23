package scan

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/docsify/internal"
)

func runScan(dir, out, exclude string, verbose bool) error {
	absDir, err := filepath.Abs(dir)
	if err != nil {
		return fmt.Errorf("error resolving directory: %w", err)
	}

	excludeSet := internal.ParseExcludeList(exclude)

	if verbose {
		fmt.Fprintf(os.Stderr, "scanning %s\n", absDir)
	}

	files, err := internal.Walk(absDir, excludeSet)
	if err != nil {
		return fmt.Errorf("walk error: %w", err)
	}

	if verbose {
		fmt.Fprintf(os.Stderr, "found %d source files\n", len(files))
	}

	graph := internal.NewGraph()

	for _, f := range files {
		if verbose {
			fmt.Fprintf(os.Stderr, "  extracting: %s\n", f.RelPath)
		}

		info, err := internal.Extract(f)
		if err != nil {
			fmt.Fprintf(os.Stderr, "  warning: skipping %s: %v\n", f.RelPath, err)
			continue
		}

		graph.AddFile(info)
	}

	graph.ResolveCallEdges()

	if err := internal.Write(graph, out); err != nil {
		return fmt.Errorf("write error: %w", err)
	}

	fmt.Printf("graph written to %s\n", out)
	fmt.Printf("  nodes: %d  edges: %d\n", graph.NodeCount(), graph.EdgeCount())

	return nil
}
