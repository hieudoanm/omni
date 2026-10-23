package text

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strings"
)

type textMatch struct {
	File    string `json:"file"`
	Line    int    `json:"line"`
	Content string `json:"content"`
}

func includeToRegex(include string) *regexp.Regexp {
	if include == "" {
		return nil
	}
	globRe := strings.ReplaceAll(regexp.QuoteMeta(include), "\\*", ".*")
	globRe = "^" + globRe + "$"
	return regexp.MustCompile(globRe)
}

func searchTextInRoots(pattern string, searchRoots []string, re *regexp.Regexp, include *regexp.Regexp, maxDepth, maxCount int) ([]textMatch, error) {
	var results []textMatch
	seen := make(map[string]bool)

	for _, root := range searchRoots {
		info, err := os.Stat(root)
		if err != nil {
			fmt.Fprintf(os.Stderr, "error: %v\n", err)
			continue
		}

		if !info.IsDir() {
			matches := searchFileText(root, pattern, re, maxCount)
			for _, m := range matches {
				key := m.File + ":" + m.Content
				if seen[key] {
					continue
				}
				seen[key] = true
				results = append(results, m)
			}
			continue
		}

		walkTextFile(re, root, maxDepth, include, &results, maxCount, seen)
	}
	return results, nil
}

func outputTextResults(results []textMatch, pattern string, jsonOutput bool) error {
	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"pattern": pattern,
			"matches": len(results),
			"results": results,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
		return nil
	}

	if len(results) == 0 {
		fmt.Println("(no matches)")
		return nil
	}

	for _, m := range results {
		fmt.Printf("%s:%d: %s\n", m.File, m.Line, m.Content)
	}
	if len(results) > 1 {
		fmt.Printf("\n%d matches\n", len(results))
	}
	return nil
}

func searchFileText(path, pattern string, re *regexp.Regexp, maxCount int) []textMatch {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil
	}
	var isBinary bool
	for _, b := range data {
		if b == 0 {
			isBinary = true
			break
		}
	}
	if isBinary {
		return nil
	}

	lines := strings.Split(string(data), "\n")
	var matches []textMatch
	for i, line := range lines {
		if re.MatchString(line) {
			matches = append(matches, textMatch{
				File:    path,
				Line:    i + 1,
				Content: line,
			})
			if maxCount > 0 && len(matches) >= maxCount {
				break
			}
		}
	}
	return matches
}
