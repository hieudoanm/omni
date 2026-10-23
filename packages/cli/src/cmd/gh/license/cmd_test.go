package license

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/shared"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "license" {
		t.Errorf("Use = %q, want 'license'", cmd.Use)
	}
	if cmd.Short != "Fetch a license template from GitHub" {
		t.Errorf("Short = %q, want 'Fetch a license template from GitHub'", cmd.Short)
	}
	wantLong := `Fetch and save a license template from the GitHub licenses API.

Fetches the list of available licenses, prompts the user to select
one (or uses --spdx-id), then writes the license body to a file.`
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := `  gh license
  gh license --spdx-id MIT
  gh license --spdx-id Apache-2.0 -o LICENSE.txt`
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	if f := cmd.Flags().Lookup("spdx-id"); f == nil {
		t.Error("expected --spdx-id flag")
	} else if f.DefValue != "" {
		t.Errorf("--spdx-id default = %q, want ''", f.DefValue)
	}
	if f := cmd.Flags().Lookup("output"); f == nil {
		t.Error("expected --output flag")
	} else if f.DefValue != "LICENSE" {
		t.Errorf("--output default = %q, want 'LICENSE'", f.DefValue)
	}
}

func TestNewCommand_RunE(t *testing.T) {
	listBody := `[{"key":"mit","name":"MIT License","spdx_id":"MIT","url":"https://","body":"MIT License"}]`
	detailBody := `{"key":"mit","name":"MIT License","spdx_id":"MIT","url":"https://","body":"MIT License"}`

	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Body: []byte(listBody)}, shared.MockResult{Body: []byte(detailBody)})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	cmd := NewCommand()
	cmd.SetArgs([]string{"--spdx-id", "MIT", "--output", "/tmp/test-license-out.txt"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
}
