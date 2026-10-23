package ignore

import (
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/shared"
)

func TestFetchIgnore(t *testing.T) {
	listBody := `["Go","Python","Rust"]`
	detailBody := `{"name":"Go","source":"# Go gitignore\n\n# Binaries\n*.exe\n*.dll\n"}`

	tests := []struct {
		name    string
		key     string
		output  string
		mocks   []shared.MockResult
		wantErr string
		wantOut string
	}{
		{
			name:   "success with name",
			key:    "Go",
			output: "test-gitignore",
			mocks: []shared.MockResult{
				{Body: []byte(listBody)},
				{Body: []byte(detailBody)},
			},
			wantOut: "# Go gitignore\n\n# Binaries\n*.exe\n*.dll\n",
		},
		{
			name:   "fetch list error",
			key:    "Go",
			output: "test-gitignore",
			mocks: []shared.MockResult{
				{Err: errors.New("network error")},
			},
			wantErr: "error fetching templates",
		},
		{
			name:   "fetch detail error",
			key:    "Go",
			output: "test-gitignore",
			mocks: []shared.MockResult{
				{Body: []byte(listBody)},
				{Err: errors.New("network error")},
			},
			wantErr: "error fetching template",
		},
		{
			name:   "invalid list JSON",
			key:    "Go",
			output: "test-gitignore",
			mocks: []shared.MockResult{
				{Body: []byte("invalid json")},
			},
			wantErr: "error parsing response",
		},
		{
			name:   "invalid detail JSON",
			key:    "Go",
			output: "test-gitignore",
			mocks: []shared.MockResult{
				{Body: []byte(listBody)},
				{Body: []byte("invalid json")},
			},
			wantErr: "error parsing response",
		},
		{
			name:   "file create error",
			key:    "Go",
			output: "/nonexistent/deep/dir/gitignore",
			mocks: []shared.MockResult{
				{Body: []byte(listBody)},
				{Body: []byte(detailBody)},
			},
			wantErr: "error creating file",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dir := t.TempDir()
			outPath := tt.output
			if !filepath.IsAbs(outPath) {
				outPath = filepath.Join(dir, outPath)
			}

			mock := shared.MockFetchSeq(tt.mocks...)
			err := fetchIgnore(tt.key, outPath, mock)

			if tt.wantErr != "" {
				if err == nil {
					t.Fatal("expected error, got nil")
				}
				if !strings.Contains(err.Error(), tt.wantErr) {
					t.Errorf("err = %q, want contains %q", err.Error(), tt.wantErr)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			data, err := os.ReadFile(outPath)
			if err != nil {
				t.Fatalf("error reading output file: %v", err)
			}
			if string(data) != tt.wantOut {
				t.Errorf("file content = %q, want %q", string(data), tt.wantOut)
			}
		})
	}
}

func TestRunIgnoreJSON(t *testing.T) {
	detailBody := `{"name":"Go","source":"# Go gitignore\n*.exe\n"}`

	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Body: []byte(detailBody)})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	err := runIgnore("Go", "", true)
	w.Close()
	out, _ := io.ReadAll(r)
	os.Stdout = old

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !strings.Contains(string(out), "Go gitignore") {
		t.Errorf("expected Go gitignore in output, got: %s", out)
	}
}

func TestRunIgnoreJSONMissingName(t *testing.T) {
	err := runIgnore("", "", true)
	if err == nil {
		t.Fatal("expected error for missing name")
	}
}

func TestRunIgnoreJSONFetchError(t *testing.T) {
	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Err: errors.New("network error")})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	err := runIgnore("Go", "", true)
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestRunIgnoreJSONParseError(t *testing.T) {
	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Body: []byte("invalid json")})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	err := runIgnore("Go", "", true)
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestRunIgnoreNonJSON(t *testing.T) {
	listBody := `["Go","Python","Rust"]`
	detailBody := `{"name":"Go","source":"# Binaries\n*.exe\n"}`

	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Body: []byte(listBody)}, shared.MockResult{Body: []byte(detailBody)})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	dir := t.TempDir()
	outPath := filepath.Join(dir, ".gitignore")
	err := runIgnore("Go", outPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	data, err := os.ReadFile(outPath)
	if err != nil {
		t.Fatalf("error reading output file: %v", err)
	}
	if !strings.Contains(string(data), "*.exe") {
		t.Errorf("expected gitignore content, got: %s", data)
	}
}

func TestNewCommand_RunE(t *testing.T) {
	listBody := `["Go","Python","Rust"]`
	detailBody := `{"name":"Go","source":"*.exe\n*.dll\n"}`

	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Body: []byte(listBody)}, shared.MockResult{Body: []byte(detailBody)})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	cmd := NewCommand()
	cmd.SetArgs([]string{"--name", "Go", "--output", "/tmp/test-gitignore-out.txt"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
}
