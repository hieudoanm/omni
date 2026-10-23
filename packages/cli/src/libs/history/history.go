package history

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

var userHomeDir = os.UserHomeDir

type Entry struct {
	Timestamp  string `json:"timestamp"`
	Source     string `json:"source"`
	Command    string `json:"command"`
	CWD        string `json:"cwd,omitempty"`
	DurationMs int64  `json:"duration_ms,omitempty"`
	Error      string `json:"error,omitempty"`
}

type CommandCount struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type Stats struct {
	TotalCLI    int            `json:"total_cli"`
	TotalMCP    int            `json:"total_mcp"`
	TopCommands []CommandCount `json:"top_commands"`
	TopErrors   []CommandCount `json:"top_errors"`
}

func storagePath() (string, error) {
	home, err := userHomeDir()
	if err != nil {
		return "", err
	}
	dir := filepath.Join(home, ".omni")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", err
	}
	return filepath.Join(dir, "history.jsonl"), nil
}

func Append(entry Entry) error {
	path, err := storagePath()
	if err != nil {
		return err
	}
	data, err := json.Marshal(entry)
	if err != nil {
		return err
	}
	f, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = f.Write(append(data, '\n'))
	return err
}

func readAll() ([]Entry, error) {
	path, err := storagePath()
	if err != nil {
		return nil, err
	}
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	var entries []Entry
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		var e Entry
		if err := json.Unmarshal([]byte(line), &e); err != nil {
			continue
		}
		entries = append(entries, e)
	}
	return entries, nil
}

func List(count int) ([]Entry, error) {
	entries, err := readAll()
	if err != nil {
		return nil, err
	}
	if count <= 0 || count > len(entries) {
		count = len(entries)
	}
	return entries[len(entries)-count:], nil
}

func Search(query string, limit int) ([]Entry, error) {
	entries, err := readAll()
	if err != nil {
		return nil, err
	}
	q := strings.ToLower(query)
	var results []Entry
	for i := len(entries) - 1; i >= 0; i-- {
		e := entries[i]
		if strings.Contains(strings.ToLower(e.Command), q) {
			results = append(results, e)
			if limit > 0 && len(results) >= limit {
				break
			}
		}
	}
	return results, nil
}

func Clear() error {
	path, err := storagePath()
	if err != nil {
		return err
	}
	if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

func ComputeStats() (*Stats, error) {
	entries, err := readAll()
	if err != nil {
		return nil, err
	}
	stats := &Stats{}
	cmdCount := make(map[string]int)
	errCount := make(map[string]int)
	for _, e := range entries {
		if e.Source == "cli" {
			stats.TotalCLI++
		} else {
			stats.TotalMCP++
		}
		cmdCount[e.Command]++
		if e.Error != "" {
			errCount[e.Command]++
		}
	}
	stats.TopCommands = topN(cmdCount, 10)
	stats.TopErrors = topN(errCount, 10)
	return stats, nil
}

func topN(counts map[string]int, n int) []CommandCount {
	var result []CommandCount
	for name, count := range counts {
		result = append(result, CommandCount{Name: name, Count: count})
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].Count > result[j].Count
	})
	if len(result) > n {
		result = result[:n]
	}
	return result
}

func (e Entry) String() string {
	var b strings.Builder
	b.WriteString(e.Timestamp)
	b.WriteString("  ")
	b.WriteString(e.Command)
	if e.Error != "" {
		b.WriteString("  [")
		b.WriteString(e.Error)
		b.WriteString("]")
	}
	return b.String()
}
