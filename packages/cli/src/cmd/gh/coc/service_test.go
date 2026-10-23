package coc

import (
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/shared"
)

func TestFetchCOC(t *testing.T) {
	listBody := `[{"key":"contributor_covenant","name":"Contributor Covenant","url":"https://","body":"# Code of Conduct\n\nBe nice."}]`
	detailBody := `{"key":"contributor_covenant","name":"Contributor Covenant","url":"https://","body":"# Code of Conduct\n\nBe nice."}`

	tests := []struct {
		name    string
		key     string
		output  string
		mocks   []shared.MockResult
		wantErr string
		wantOut string
	}{
		{
			name:   "success with key",
			key:    "contributor_covenant",
			output: "test-coc.md",
			mocks: []shared.MockResult{
				{Body: []byte(listBody)},
				{Body: []byte(detailBody)},
			},
			wantOut: "# Code of Conduct\n\nBe nice.",
		},
		{
			name:   "fetch list error",
			key:    "contributor_covenant",
			output: "test-coc.md",
			mocks: []shared.MockResult{
				{Err: errors.New("network error")},
			},
			wantErr: "error fetching codes of conduct",
		},
		{
			name:   "fetch detail error",
			key:    "contributor_covenant",
			output: "test-coc.md",
			mocks: []shared.MockResult{
				{Body: []byte(listBody)},
				{Err: errors.New("network error")},
			},
			wantErr: "error fetching code of conduct",
		},
		{
			name:   "invalid list JSON",
			key:    "contributor_covenant",
			output: "test-coc.md",
			mocks: []shared.MockResult{
				{Body: []byte("invalid json")},
			},
			wantErr: "error parsing response",
		},
		{
			name:   "invalid detail JSON",
			key:    "contributor_covenant",
			output: "test-coc.md",
			mocks: []shared.MockResult{
				{Body: []byte(listBody)},
				{Body: []byte("invalid json")},
			},
			wantErr: "error parsing response",
		},
		{
			name:   "file create error",
			key:    "contributor_covenant",
			output: "/nonexistent/deep/dir/coc.md",
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
			err := fetchCOC(tt.key, outPath, mock)

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

func TestRunCOCJSON(t *testing.T) {
	detailBody := `{"key":"contributor_covenant","name":"Contributor Covenant","url":"https://","body":"# Code of Conduct"}`

	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Body: []byte(detailBody)})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	err := runCoc("contributor_covenant", "", true)
	w.Close()
	out, _ := io.ReadAll(r)
	os.Stdout = old

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !strings.Contains(string(out), "Code of Conduct") {
		t.Errorf("expected Code of Conduct in output, got: %s", out)
	}
}

func TestRunCOCJSONMissingKey(t *testing.T) {
	err := runCoc("", "", true)
	if err == nil {
		t.Fatal("expected error for missing key")
	}
}

func TestRunCOCJSONFetchError(t *testing.T) {
	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Err: errors.New("network error")})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	err := runCoc("contributor_covenant", "", true)
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestRunCOCJSONParseError(t *testing.T) {
	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Body: []byte("invalid json")})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	err := runCoc("contributor_covenant", "", true)
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestRunCOCNonJSON(t *testing.T) {
	listBody := `[{"key":"contributor_covenant","name":"Contributor Covenant","url":"https://","body":"# Code of Conduct"}]`
	detailBody := `{"key":"contributor_covenant","name":"Contributor Covenant","url":"https://","body":"# Code of Conduct"}`

	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Body: []byte(listBody)}, shared.MockResult{Body: []byte(detailBody)})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	dir := t.TempDir()
	outPath := filepath.Join(dir, "coc.md")
	err := runCoc("contributor_covenant", outPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	data, err := os.ReadFile(outPath)
	if err != nil {
		t.Fatalf("error reading output file: %v", err)
	}
	if string(data) != "# Code of Conduct" {
		t.Errorf("file content = %q, want %q", string(data), "# Code of Conduct")
	}
}
