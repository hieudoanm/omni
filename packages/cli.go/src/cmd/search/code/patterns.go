package code

import (
	"path/filepath"
	"regexp"
	"strings"
)

type codePattern struct {
	re      *regexp.Regexp
	nameIdx int
	kind    string
}

func codePatternsFor(path, langFilter string) (string, []codePattern, bool) {
	ext := strings.ToLower(filepath.Ext(path))

	switch ext {
	case ".go":
		if langFilter != "" && langFilter != "go" {
			return "", nil, false
		}
		return "go", []codePattern{
			{regexp.MustCompile(`^func\s+(\w+)\s*\(`), 1, "method"},
			{regexp.MustCompile(`^func\s+(\w+)\s*\(`), 1, "function"},
			{regexp.MustCompile(`^type\s+(\w+)\s`), 1, "type"},
			{regexp.MustCompile(`^var\s+(\w+)`), 1, "variable"},
			{regexp.MustCompile(`^const\s+(\w+)`), 1, "constant"},
		}, true
	case ".ts", ".tsx", ".js", ".jsx":
		if langFilter != "" && langFilter != "ts" && langFilter != "js" {
			return "", nil, false
		}
		return "typescript", []codePattern{
			{regexp.MustCompile(`^(?:export\s+)?(?:async\s+)?function\s+(\w+)`), 1, "function"},
			{regexp.MustCompile(`^(?:export\s+)?class\s+(\w+)`), 1, "class"},
			{regexp.MustCompile(`^(?:export\s+)?interface\s+(\w+)`), 1, "interface"},
			{regexp.MustCompile(`^(?:export\s+)?type\s+(\w+)`), 1, "type"},
			{regexp.MustCompile(`^(?:export\s+)?const\s+(\w+)`), 1, "variable"},
			{regexp.MustCompile(`^(?:export\s+)?enum\s+(\w+)`), 1, "enum"},
		}, true
	case ".py":
		if langFilter != "" && langFilter != "py" {
			return "", nil, false
		}
		return "python", []codePattern{
			{regexp.MustCompile(`^(?:async\s+)?def\s+(\w+)`), 1, "function"},
			{regexp.MustCompile(`^class\s+(\w+)`), 1, "class"},
			{regexp.MustCompile(`^(\w+)\s*=\s*(?:lambda|[{(['"0-9])`), 1, "variable"},
		}, true
	case ".rs":
		if langFilter != "" && langFilter != "rs" {
			return "", nil, false
		}
		return "rust", []codePattern{
			{regexp.MustCompile(`^(?:pub\s+)?fn\s+(\w+)`), 1, "function"},
			{regexp.MustCompile(`^(?:pub\s+)?struct\s+(\w+)`), 1, "struct"},
			{regexp.MustCompile(`^(?:pub\s+)?trait\s+(\w+)`), 1, "trait"},
			{regexp.MustCompile(`^(?:pub\s+)?enum\s+(\w+)`), 1, "enum"},
			{regexp.MustCompile(`^(?:pub\s+)?type\s+(\w+)`), 1, "type"},
			{regexp.MustCompile(`^(?:pub\s+)?const\s+(\w+)`), 1, "constant"},
		}, true
	}
	return "", nil, false
}

func containsKind(patterns []codePattern, kind string) bool {
	for _, p := range patterns {
		if p.kind == kind {
			return true
		}
	}
	return false
}
