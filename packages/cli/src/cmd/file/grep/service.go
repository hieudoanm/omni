package grep

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
)

func compileSearchPattern(pattern string, fixed, ignoreCase bool) (*regexp.Regexp, error) {
	if fixed {
		return regexp.Compile(regexp.QuoteMeta(pattern))
	}
	if ignoreCase {
		pattern = "(?i)" + pattern
	}
	re, err := regexp.Compile(pattern)
	if err != nil {
		return nil, fmt.Errorf("invalid regex %q: %w", pattern, err)
	}
	return re, nil
}

func compileIncludePattern(include string) *regexp.Regexp {
	if include == "" {
		return nil
	}
	return regexp.MustCompile(globToRegex(include))
}

func grepFiles(re *regexp.Regexp, searchPaths []string, include *regexp.Regexp, context, maxCount int) ([]lineMatch, int) {
	var matches []lineMatch
	var totalFiles int

	for _, root := range searchPaths {
		info, err := os.Stat(root)
		if err != nil {
			fmt.Fprintf(os.Stderr, "error: %v\n", err)
			continue
		}

		if !info.IsDir() {
			m, f := grepFile(re, root, context, maxCount)
			matches = append(matches, m...)
			totalFiles += f
			continue
		}

		filepath.Walk(root, func(path string, fi os.FileInfo, err error) error {
			if err != nil || fi.IsDir() {
				return nil
			}
			if include != nil && !include.MatchString(fi.Name()) {
				return nil
			}
			if isBinary(path) {
				return nil
			}
			m, f := grepFile(re, path, context, maxCount)
			matches = append(matches, m...)
			totalFiles += f
			return nil
		})
	}
	return matches, totalFiles
}

func grepFile(re *regexp.Regexp, path string, context, maxCount int) ([]lineMatch, int) {
	fileMatches, err := searchFile(re, path, context, maxCount)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error searching %s: %v\n", path, err)
		return nil, 0
	}
	for i := range fileMatches {
		fileMatches[i].File = path
	}
	return fileMatches, 1
}

func outputGrepResults(matches []lineMatch, totalFiles int, pattern string, jsonOutput bool) error {
	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"pattern": pattern,
			"files":   totalFiles,
			"matches": len(matches),
			"results": matches,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
		return nil
	}

	if len(matches) == 0 {
		fmt.Println("(no matches)")
		return nil
	}

	multiFile := totalFiles > 1
	for _, m := range matches {
		var prefix string
		if multiFile {
			prefix = m.File + ":"
		}
		if m.Before != "" {
			fmt.Printf("%s  %s\n", prefix, m.Before)
		}
		fmt.Printf("%s%d: %s\n", prefix, m.Line, m.Content)
		if m.After != "" {
			fmt.Printf("%s  %s\n", prefix, m.After)
		}
	}
	return nil
}
