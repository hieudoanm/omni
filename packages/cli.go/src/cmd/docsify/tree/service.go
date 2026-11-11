package tree

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

type gitIgnoreRule struct {
	pattern string
	negate  bool
	dirOnly bool
}

type gitIgnore struct {
	dir   string
	rules []gitIgnoreRule
}

func runTree(treeDir, treeOut string, ignoreDirs, ignoreFiles []string) error {
	absDir, err := filepath.Abs(treeDir)
	if err != nil {
		return fmt.Errorf("resolve directory: %w", err)
	}
	ignore, err := loadGitignore(absDir)
	if err != nil {
		return fmt.Errorf("load .gitignore: %w", err)
	}
	out, err := os.Create(treeOut)
	if err != nil {
		return fmt.Errorf("create output: %w", err)
	}
	defer out.Close()

	ignoreDirSet := makeSet(ignoreDirs)
	ignoreFileSet := makeSet(ignoreFiles)

	fmt.Fprintln(out, "# TREE")
	fmt.Fprintln(out)
	fmt.Fprintln(out, "```text")
	dirs, files, err := writeTree(out, absDir, absDir, "", ignore, ignoreDirSet, ignoreFileSet)
	if err != nil {
		return err
	}
	fmt.Fprintln(out, "```")
	fmt.Fprintf(out, "\n%d directories, %d files\n", dirs, files)
	return nil
}

func makeSet(items []string) map[string]bool {
	s := make(map[string]bool, len(items))
	for _, item := range items {
		s[item] = true
	}
	return s
}

func loadGitignore(dir string) (*gitIgnore, error) {
	f, err := os.Open(filepath.Join(dir, ".gitignore"))
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	defer f.Close()

	var rules []gitIgnoreRule
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		negate := strings.HasPrefix(line, "!")
		if negate {
			line = line[1:]
		}
		dirOnly := strings.HasSuffix(line, "/")
		if dirOnly {
			line = strings.TrimSuffix(line, "/")
		}
		line = strings.TrimPrefix(line, "/")
		rules = append(rules, gitIgnoreRule{pattern: line, negate: negate, dirOnly: dirOnly})
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return &gitIgnore{dir: dir, rules: rules}, nil
}

func (gi *gitIgnore) ignore(relPath string, isDir bool) bool {
	if gi == nil {
		return false
	}
	adjusted, err := filepath.Rel(gi.dir, filepath.Join(gi.dir, relPath))
	if err != nil {
		adjusted = relPath
	}
	var ignored bool
	for _, r := range gi.rules {
		if r.dirOnly && !isDir {
			continue
		}
		matched, _ := filepath.Match(r.pattern, adjusted)
		if !matched {
			matched, _ = filepath.Match(r.pattern, filepath.Base(adjusted))
		}
		if !matched && !strings.Contains(r.pattern, "/") {
			matched = matchAnySegment(r.pattern, adjusted)
		}
		if matched {
			if r.negate {
				ignored = false
			} else {
				ignored = true
			}
		}
	}
	return ignored
}

func matchAnySegment(pattern, path string) bool {
	parts := strings.Split(path, string(filepath.Separator))
	for _, part := range parts {
		if matched, _ := filepath.Match(pattern, part); matched {
			return true
		}
	}
	return false
}

func writeTree(w io.Writer, root, dir string, prefix string, ignore *gitIgnore, ignoreDirs, ignoreFiles map[string]bool) (int, int, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return 0, 0, err
	}

	var dirNames, fileNames []string
	for _, e := range entries {
		name := e.Name()
		if strings.HasPrefix(name, ".") {
			continue
		}
		if e.IsDir() && ignoreDirs[name] {
			continue
		}
		if !e.IsDir() && ignoreFiles[name] {
			continue
		}
		rel, _ := filepath.Rel(root, filepath.Join(dir, name))
		if ignore.ignore(rel, e.IsDir()) {
			continue
		}
		if e.IsDir() {
			dirNames = append(dirNames, name)
		} else {
			fileNames = append(fileNames, name)
		}
	}
	sort.Strings(dirNames)
	sort.Strings(fileNames)

	totalDirs := len(dirNames)
	totalFiles := len(fileNames)

	ordered := make([]string, 0, len(dirNames)+len(fileNames))
	ordered = append(ordered, dirNames...)
	ordered = append(ordered, fileNames...)

	for i, name := range ordered {
		isLast := i == len(ordered)-1
		isDir := i < len(dirNames)

		var connector, childPrefix string
		if isLast {
			connector = "└── "
			childPrefix = prefix + "    "
		} else {
			connector = "├── "
			childPrefix = prefix + "│   "
		}

		if isDir {
			fmt.Fprintf(w, "%s%s%s/\n", prefix, connector, name)
			subDir := filepath.Join(dir, name)
			subIgnore, err := loadGitignore(subDir)
			if err != nil {
				return 0, 0, fmt.Errorf("load .gitignore in %s: %w", subDir, err)
			}
			merged := mergeIgnores(ignore, subIgnore)
			subDirs, subFiles, err := writeTree(w, root, subDir, childPrefix, merged, ignoreDirs, ignoreFiles)
			if err != nil {
				return 0, 0, err
			}
			totalDirs += subDirs
			totalFiles += subFiles
		} else {
			rel, _ := filepath.Rel(root, filepath.Join(dir, name))
			fmt.Fprintf(w, "%s%s[%s](./%s)\n", prefix, connector, name, rel)
		}
	}
	return totalDirs, totalFiles, nil
}

func mergeIgnores(parent, child *gitIgnore) *gitIgnore {
	if parent == nil {
		return child
	}
	if child == nil {
		return parent
	}
	merged := &gitIgnore{dir: parent.dir}
	merged.rules = make([]gitIgnoreRule, 0, len(parent.rules)+len(child.rules))
	merged.rules = append(merged.rules, parent.rules...)
	childRel, err := filepath.Rel(parent.dir, child.dir)
	if err == nil && childRel != "." {
		for _, r := range child.rules {
			if strings.Contains(r.pattern, "/") {
				r.pattern = childRel + "/" + r.pattern
			}
			merged.rules = append(merged.rules, r)
		}
	} else {
		merged.rules = append(merged.rules, child.rules...)
	}
	return merged
}
