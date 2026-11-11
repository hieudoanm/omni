package history

import (
	"errors"
	"os"
	"path/filepath"
	"testing"
)

func setHomeTempDir(t *testing.T) string {
	t.Helper()
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)
	return tmpDir
}

func TestAppendAndList(t *testing.T) {
	setHomeTempDir(t)

	e1 := Entry{Timestamp: "2025-01-01T00:00:00Z", Source: "cli", Command: "ls -la", CWD: "/tmp", DurationMs: 100}
	e2 := Entry{Timestamp: "2025-01-01T00:00:01Z", Source: "mcp", Command: "file.read", CWD: "/tmp", DurationMs: 50}

	if err := Append(e1); err != nil {
		t.Fatalf("Append failed: %v", err)
	}
	if err := Append(e2); err != nil {
		t.Fatalf("Append failed: %v", err)
	}

	entries, err := List(0)
	if err != nil {
		t.Fatalf("List failed: %v", err)
	}
	if len(entries) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(entries))
	}
	if entries[0].Command != "ls -la" {
		t.Errorf("expected first entry command 'ls -la', got %q", entries[0].Command)
	}
	if entries[1].Command != "file.read" {
		t.Errorf("expected second entry command 'file.read', got %q", entries[1].Command)
	}
}

func TestListWithCount(t *testing.T) {
	setHomeTempDir(t)

	for i := 0; i < 10; i++ {
		Append(Entry{Timestamp: "2025-01-01T00:00:00Z", Source: "cli", Command: "cmd", DurationMs: 0})
	}

	entries, err := List(3)
	if err != nil {
		t.Fatalf("List failed: %v", err)
	}
	if len(entries) != 3 {
		t.Fatalf("expected 3 entries, got %d", len(entries))
	}
}

func TestListEmpty(t *testing.T) {
	setHomeTempDir(t)
	entries, err := List(10)
	if err != nil {
		t.Fatalf("List on empty history failed: %v", err)
	}
	if len(entries) != 0 {
		t.Fatalf("expected 0 entries, got %d", len(entries))
	}
}

func TestSearchEmpty(t *testing.T) {
	setHomeTempDir(t)
	results, err := Search("foo", 10)
	if err != nil {
		t.Fatalf("Search on empty history failed: %v", err)
	}
	if len(results) != 0 {
		t.Fatalf("expected 0 results, got %d", len(results))
	}
}

func TestSearchExactMatch(t *testing.T) {
	setHomeTempDir(t)

	Append(Entry{Timestamp: "2025-01-01T00:00:00Z", Source: "cli", Command: "ls -la", DurationMs: 0})
	Append(Entry{Timestamp: "2025-01-01T00:00:01Z", Source: "cli", Command: "git status", DurationMs: 0})
	Append(Entry{Timestamp: "2025-01-01T00:00:02Z", Source: "cli", Command: "ls -la", DurationMs: 0})

	results, err := Search("ls -la", 10)
	if err != nil {
		t.Fatalf("Search failed: %v", err)
	}
	if len(results) != 2 {
		t.Fatalf("expected 2 results, got %d", len(results))
	}
}

func TestSearchPartialMatch(t *testing.T) {
	setHomeTempDir(t)

	Append(Entry{Timestamp: "2025-01-01T00:00:00Z", Source: "cli", Command: "/usr/bin/python script.py", DurationMs: 0})
	Append(Entry{Timestamp: "2025-01-01T00:00:01Z", Source: "cli", Command: "python -m pytest", DurationMs: 0})
	Append(Entry{Timestamp: "2025-01-01T00:00:02Z", Source: "cli", Command: "go test ./...", DurationMs: 0})

	results, err := Search("python", 10)
	if err != nil {
		t.Fatalf("Search failed: %v", err)
	}
	if len(results) != 2 {
		t.Fatalf("expected 2 results, got %d", len(results))
	}
}

func TestSearchWithLimit(t *testing.T) {
	setHomeTempDir(t)

	for i := 0; i < 10; i++ {
		Append(Entry{Timestamp: "2025-01-01T00:00:00Z", Source: "cli", Command: "build", DurationMs: 0})
	}

	results, err := Search("build", 3)
	if err != nil {
		t.Fatalf("Search failed: %v", err)
	}
	if len(results) != 3 {
		t.Fatalf("expected 3 results, got %d", len(results))
	}
}

func TestSearchCaseInsensitive(t *testing.T) {
	setHomeTempDir(t)

	Append(Entry{Timestamp: "2025-01-01T00:00:00Z", Source: "cli", Command: "Git Push", DurationMs: 0})

	results, err := Search("git push", 10)
	if err != nil {
		t.Fatalf("Search failed: %v", err)
	}
	if len(results) != 1 {
		t.Fatalf("expected 1 result, got %d", len(results))
	}
}

func TestClear(t *testing.T) {
	setHomeTempDir(t)

	Append(Entry{Timestamp: "2025-01-01T00:00:00Z", Source: "cli", Command: "ls", DurationMs: 0})

	if err := Clear(); err != nil {
		t.Fatalf("Clear failed: %v", err)
	}

	entries, err := List(10)
	if err != nil {
		t.Fatalf("List after clear failed: %v", err)
	}
	if len(entries) != 0 {
		t.Fatalf("expected 0 entries after clear, got %d", len(entries))
	}
}

func TestClearEmpty(t *testing.T) {
	setHomeTempDir(t)
	if err := Clear(); err != nil {
		t.Fatalf("Clear on empty history should not error: %v", err)
	}
}

func TestComputeStats(t *testing.T) {
	setHomeTempDir(t)

	Append(Entry{Timestamp: "2025-01-01T00:00:00Z", Source: "cli", Command: "ls", DurationMs: 10})
	Append(Entry{Timestamp: "2025-01-01T00:00:01Z", Source: "cli", Command: "ls", DurationMs: 20})
	Append(Entry{Timestamp: "2025-01-01T00:00:02Z", Source: "mcp", Command: "file.read", DurationMs: 30, Error: "not found"})
	Append(Entry{Timestamp: "2025-01-01T00:00:03Z", Source: "mcp", Command: "file.write", DurationMs: 40})

	stats, err := ComputeStats()
	if err != nil {
		t.Fatalf("ComputeStats failed: %v", err)
	}
	if stats.TotalCLI != 2 {
		t.Errorf("expected TotalCLI 2, got %d", stats.TotalCLI)
	}
	if stats.TotalMCP != 2 {
		t.Errorf("expected TotalMCP 2, got %d", stats.TotalMCP)
	}
	if len(stats.TopCommands) != 3 {
		t.Fatalf("expected 3 top commands, got %d", len(stats.TopCommands))
	}
	if stats.TopCommands[0].Name != "ls" || stats.TopCommands[0].Count != 2 {
		t.Errorf("expected top command 'ls' with count 2, got %q with count %d", stats.TopCommands[0].Name, stats.TopCommands[0].Count)
	}
	if len(stats.TopErrors) != 1 {
		t.Fatalf("expected 1 top error, got %d", len(stats.TopErrors))
	}
	if stats.TopErrors[0].Name != "file.read" {
		t.Errorf("expected top error 'file.read', got %q", stats.TopErrors[0].Name)
	}
}

func TestComputeStatsEmpty(t *testing.T) {
	setHomeTempDir(t)
	stats, err := ComputeStats()
	if err != nil {
		t.Fatalf("ComputeStats on empty history failed: %v", err)
	}
	if stats.TotalCLI != 0 || stats.TotalMCP != 0 {
		t.Errorf("expected zero counts, got CLI=%d MCP=%d", stats.TotalCLI, stats.TotalMCP)
	}
	if len(stats.TopCommands) != 0 {
		t.Errorf("expected no top commands, got %d", len(stats.TopCommands))
	}
}

func TestEntryString(t *testing.T) {
	e := Entry{Timestamp: "2025-01-01T00:00:00Z", Source: "cli", Command: "ls -la", CWD: "/tmp", DurationMs: 100}
	s := e.String()
	if s != "2025-01-01T00:00:00Z  ls -la" {
		t.Errorf("unexpected String(): %q", s)
	}
}

func TestStoragePath_MkdirAllError(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)
	// Create .omni as a file so MkdirAll fails
	os.WriteFile(filepath.Join(tmpDir, ".omni"), []byte("x"), 0644)
	_, err := storagePath()
	if err == nil {
		t.Error("expected error when .omni is a file")
	}
}

func TestClear_RemoveError(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)

	Append(Entry{Command: "test", Timestamp: "now", Source: "cli"})

	// Make .omni directory read-only so Remove fails
	dir := filepath.Join(tmpDir, ".omni")
	os.Chmod(dir, 0555)
	defer os.Chmod(dir, 0755)

	err := Clear()
	if err == nil {
		t.Error("expected error when directory is read-only")
	}
}

func TestAppend_OpenFileError(t *testing.T) {
	tmpDir := t.TempDir()
	t.Setenv("HOME", tmpDir)
	t.Setenv("USERPROFILE", tmpDir)

	Append(Entry{Command: "first", Timestamp: "now", Source: "cli"})

	// Make the history file read-only so OpenFile with O_WRONLY fails
	path, _ := storagePath()
	os.Chmod(path, 0444)
	defer os.Chmod(path, 0644)

	err := Append(Entry{Command: "second", Timestamp: "now", Source: "cli"})
	if err == nil {
		t.Error("expected error when history file is read-only")
	}
}

func TestEntryStringWithError(t *testing.T) {
	e := Entry{Timestamp: "2025-01-01T00:00:00Z", Source: "cli", Command: "rm -rf /", DurationMs: 500, Error: "permission denied"}
	s := e.String()
	if s != "2025-01-01T00:00:00Z  rm -rf /  [permission denied]" {
		t.Errorf("unexpected String(): %q", s)
	}
}

func TestTopN(t *testing.T) {
	tests := []struct {
		name     string
		counts   map[string]int
		n        int
		wantLen  int
		wantName string
		wantSort bool
	}{
		{name: "empty", counts: map[string]int{}, n: 5, wantLen: 0},
		{name: "single", counts: map[string]int{"a": 1}, n: 5, wantLen: 1, wantName: "a"},
		{name: "multiple", counts: map[string]int{"a": 3, "b": 5, "c": 1}, n: 3, wantLen: 3, wantName: "b", wantSort: true},
		{name: "truncation", counts: map[string]int{"a": 1, "b": 2, "c": 3, "d": 4, "e": 5}, n: 3, wantLen: 3, wantName: "e", wantSort: true},
		{name: "n_exceeds_count", counts: map[string]int{"x": 10}, n: 100, wantLen: 1, wantName: "x"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := topN(tt.counts, tt.n)
			if len(result) != tt.wantLen {
				t.Errorf("topN() len = %d, want %d", len(result), tt.wantLen)
			}
			if tt.wantLen > 0 && len(result) > 0 {
				if result[0].Name != tt.wantName {
					t.Errorf("topN()[0].Name = %q, want %q", result[0].Name, tt.wantName)
				}
				if tt.wantSort && len(result) > 1 {
					for i := 1; i < len(result); i++ {
						if result[i-1].Count < result[i].Count {
							t.Errorf("topN() not sorted descending at index %d", i)
						}
					}
				}
			}
		})
	}
}

func TestReadAllCorruptedLines(t *testing.T) {
	baseDir := t.TempDir()
	dir := filepath.Join(baseDir, ".omni")
	os.MkdirAll(dir, 0755)
	path := filepath.Join(dir, "history.jsonl")
	data := `{"timestamp":"2025-01-01T00:00:00Z","source":"cli","command":"ls"}
not json
{"timestamp":"2025-01-01T00:00:01Z","source":"cli","command":"pwd"}
`
	os.WriteFile(path, []byte(data), 0644)

	orig := userHomeDir
	userHomeDir = func() (string, error) { return baseDir, nil }
	defer func() { userHomeDir = orig }()

	entries, err := readAll()
	if err != nil {
		t.Fatalf("readAll failed: %v", err)
	}
	if len(entries) != 2 {
		t.Fatalf("expected 2 entries (skipping corrupted), got %d", len(entries))
	}
}

func TestReadAllReadError(t *testing.T) {
	baseDir := t.TempDir()
	dir := filepath.Join(baseDir, ".omni")
	os.MkdirAll(dir, 0755)
	path := filepath.Join(dir, "history.jsonl")
	os.Mkdir(path, 0755)

	orig := userHomeDir
	userHomeDir = func() (string, error) { return baseDir, nil }
	defer func() { userHomeDir = orig }()

	_, err := readAll()
	if err == nil {
		t.Error("expected error when history.jsonl is a directory")
	}
}

func TestStoragePathUserHomeDirError(t *testing.T) {
	orig := userHomeDir
	userHomeDir = func() (string, error) { return "", errors.New("no home dir") }
	defer func() { userHomeDir = orig }()

	_, err := storagePath()
	if err == nil {
		t.Error("expected error when userHomeDir fails")
	}
}

func TestClearStoragePathError(t *testing.T) {
	orig := userHomeDir
	userHomeDir = func() (string, error) { return "", errors.New("no home dir") }
	defer func() { userHomeDir = orig }()

	err := Clear()
	if err == nil {
		t.Error("expected error when storagePath fails in Clear")
	}
}

func TestAppendStoragePathError(t *testing.T) {
	orig := userHomeDir
	userHomeDir = func() (string, error) { return "", errors.New("no home dir") }
	defer func() { userHomeDir = orig }()

	err := Append(Entry{Command: "test", Timestamp: "now", Source: "cli"})
	if err == nil {
		t.Error("expected error when storagePath fails in Append")
	}
}

func TestListStoragePathError(t *testing.T) {
	orig := userHomeDir
	userHomeDir = func() (string, error) { return "", errors.New("no home dir") }
	defer func() { userHomeDir = orig }()

	_, err := List(10)
	if err == nil {
		t.Error("expected error when storagePath fails in List")
	}
}

func TestSearchStoragePathError(t *testing.T) {
	orig := userHomeDir
	userHomeDir = func() (string, error) { return "", errors.New("no home dir") }
	defer func() { userHomeDir = orig }()

	_, err := Search("foo", 10)
	if err == nil {
		t.Error("expected error when storagePath fails in Search")
	}
}

func TestComputeStatsStoragePathError(t *testing.T) {
	orig := userHomeDir
	userHomeDir = func() (string, error) { return "", errors.New("no home dir") }
	defer func() { userHomeDir = orig }()

	_, err := ComputeStats()
	if err == nil {
		t.Error("expected error when storagePath fails in ComputeStats")
	}
}

func TestComputeStatsTopNTruncation(t *testing.T) {
	setHomeTempDir(t)

	cmds := []string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"}
	for _, c := range cmds {
		Append(Entry{Timestamp: "now", Source: "cli", Command: c, DurationMs: 0})
	}

	stats, err := ComputeStats()
	if err != nil {
		t.Fatalf("ComputeStats failed: %v", err)
	}
	if len(stats.TopCommands) != 10 {
		t.Errorf("expected 10 top commands (truncated), got %d", len(stats.TopCommands))
	}
}

func TestComputeStatsWithErrors(t *testing.T) {
	setHomeTempDir(t)

	Append(Entry{Timestamp: "now", Source: "cli", Command: "build", DurationMs: 100, Error: "timeout"})
	Append(Entry{Timestamp: "now", Source: "cli", Command: "build", DurationMs: 200, Error: "timeout"})
	Append(Entry{Timestamp: "now", Source: "cli", Command: "deploy", DurationMs: 300, Error: "auth failed"})
	Append(Entry{Timestamp: "now", Source: "cli", Command: "deploy", DurationMs: 0})
	Append(Entry{Timestamp: "now", Source: "mcp", Command: "file.read", DurationMs: 0})

	stats, err := ComputeStats()
	if err != nil {
		t.Fatalf("ComputeStats failed: %v", err)
	}
	if stats.TotalCLI != 4 {
		t.Errorf("expected TotalCLI 4, got %d", stats.TotalCLI)
	}
	if stats.TotalMCP != 1 {
		t.Errorf("expected TotalMCP 1, got %d", stats.TotalMCP)
	}
	// "build" appears twice both with errors, "deploy" once with error
	if len(stats.TopErrors) != 2 {
		t.Errorf("expected 2 top errors, got %d", len(stats.TopErrors))
	}
	if stats.TopErrors[0].Name != "build" || stats.TopErrors[0].Count != 2 {
		t.Errorf("expected top error 'build' with count 2, got %q with count %d", stats.TopErrors[0].Name, stats.TopErrors[0].Count)
	}
}
