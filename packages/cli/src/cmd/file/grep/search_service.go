package grep

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/internal"
)

type lineMatch struct {
	File    string `json:"file,omitempty"`
	Line    int    `json:"line"`
	Content string `json:"content"`
	Before  string `json:"before,omitempty"`
	After   string `json:"after,omitempty"`
}

func searchFile(re *regexp.Regexp, path string, context int, maxCount int) ([]lineMatch, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	lines := internal.SplitLines(string(data))
	var matches []lineMatch

	for i, line := range lines {
		if re.MatchString(line) {
			m := lineMatch{
				Line:    i + 1,
				Content: line,
			}
			if context > 0 {
				start := i - context
				if start < 0 {
					start = 0
				}
				end := i + context + 1
				if end > len(lines) {
					end = len(lines)
				}
				var ctxLines []string
				for j := start; j < end; j++ {
					mark := " "
					if j == i {
						mark = ">"
					}
					ctxLines = append(ctxLines, fmt.Sprintf("%s%5d| %s", mark, j+1, lines[j]))
				}
				m.Before = strings.Join(ctxLines[:context], "\n")
				m.After = strings.Join(ctxLines, "\n")
			}
			matches = append(matches, m)
			if maxCount > 0 && len(matches) >= maxCount {
				break
			}
		}
	}
	return matches, nil
}

func globToRegex(pattern string) string {
	result := regexp.QuoteMeta(pattern)
	result = strings.ReplaceAll(result, "\\*", ".*")
	result = strings.ReplaceAll(result, "\\?", ".")
	return "^" + result + "$"
}

var binaryExtensions = map[string]bool{
	".exe": true, ".bin": true, ".o": true, ".a": true, ".so": true,
	".dll": true, ".dylib": true, ".jpg": true, ".jpeg": true, ".png": true,
	".gif": true, ".ico": true, ".pdf": true, ".zip": true, ".tar": true,
	".gz": true, ".bz2": true, ".7z": true, ".mp3": true, ".mp4": true,
	".mov": true, ".avi": true, ".webp": true, ".woff": true, ".woff2": true,
}

func isBinary(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	return binaryExtensions[ext]
}
