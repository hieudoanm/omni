package license

import (
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/shared"
)

func TestFetchLicense(t *testing.T) {
	listBody := `[{"key":"mit","name":"MIT License","spdx_id":"MIT","url":"https://","body":"MIT License\n\nPermission is hereby granted..."}]`
	detailBody := `{"key":"mit","name":"MIT License","spdx_id":"MIT","url":"https://","body":"MIT License\n\nPermission is hereby granted..."}`

	tests := []struct {
		name    string
		spdxID  string
		output  string
		mocks   []shared.MockResult
		wantErr string
		wantOut string
	}{
		{
			name:   "success with spdx-id",
			spdxID: "MIT",
			output: "test-license",
			mocks: []shared.MockResult{
				{Body: []byte(listBody)},
				{Body: []byte(detailBody)},
			},
			wantOut: "MIT License\n\nPermission is hereby granted...",
		},
		{
			name:   "fetch list error",
			spdxID: "MIT",
			output: "test-license",
			mocks: []shared.MockResult{
				{Err: errors.New("network error")},
			},
			wantErr: "error fetching licenses",
		},
		{
			name:   "fetch detail error",
			spdxID: "MIT",
			output: "test-license",
			mocks: []shared.MockResult{
				{Body: []byte(listBody)},
				{Err: errors.New("network error")},
			},
			wantErr: "error fetching license",
		},
		{
			name:   "invalid list JSON",
			spdxID: "MIT",
			output: "test-license",
			mocks: []shared.MockResult{
				{Body: []byte("invalid json")},
			},
			wantErr: "error parsing response",
		},
		{
			name:   "invalid detail JSON",
			spdxID: "MIT",
			output: "test-license",
			mocks: []shared.MockResult{
				{Body: []byte(listBody)},
				{Body: []byte("invalid json")},
			},
			wantErr: "error parsing response",
		},
		{
			name:   "file create error",
			spdxID: "MIT",
			output: "/nonexistent/deep/dir/license",
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
			err := fetchLicense(tt.spdxID, outPath, mock)

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

func TestRunLicenseJSON(t *testing.T) {
	detailBody := `{"key":"mit","name":"MIT License","spdx_id":"MIT","url":"https://","body":"MIT License"}`

	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Body: []byte(detailBody)})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	err := runLicense("MIT", "", true)
	w.Close()
	out, _ := io.ReadAll(r)
	os.Stdout = old

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !strings.Contains(string(out), "MIT License") {
		t.Errorf("expected MIT License in output, got: %s", out)
	}
}

func TestRunLicenseJSONMissingSPDX(t *testing.T) {
	err := runLicense("", "", true)
	if err == nil {
		t.Fatal("expected error for missing spdx-id")
	}
}

func TestRunLicenseJSONFetchError(t *testing.T) {
	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Err: errors.New("network error")})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	err := runLicense("MIT", "", true)
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestRunLicenseJSONParseError(t *testing.T) {
	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Body: []byte("invalid json")})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	err := runLicense("MIT", "", true)
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestRunLicenseNonJSON(t *testing.T) {
	listBody := `[{"key":"mit","name":"MIT License","spdx_id":"MIT","url":"https://","body":"MIT License"}]`
	detailBody := `{"key":"mit","name":"MIT License","spdx_id":"MIT","url":"https://","body":"MIT License"}`

	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Body: []byte(listBody)}, shared.MockResult{Body: []byte(detailBody)})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	dir := t.TempDir()
	outPath := filepath.Join(dir, "license.txt")
	err := runLicense("MIT", outPath, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	data, err := os.ReadFile(outPath)
	if err != nil {
		t.Fatalf("error reading output file: %v", err)
	}
	if string(data) != "MIT License" {
		t.Errorf("file content = %q, want %q", string(data), "MIT License")
	}
}
