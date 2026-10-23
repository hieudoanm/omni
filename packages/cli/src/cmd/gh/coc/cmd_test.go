package coc

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/shared"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "coc" {
		t.Errorf("Use = %q, want 'coc'", cmd.Use)
	}
	if cmd.Short != "Fetch a GitHub Code of Conduct" {
		t.Errorf("Short = %q, want 'Fetch a GitHub Code of Conduct'", cmd.Short)
	}
	wantLong := `Fetch and save a GitHub Code of Conduct to a file.

Fetches the list of available codes of conduct from the GitHub API,
prompts the user to select one (or uses --key), then writes the body
to a file.`
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := `  gh coc
  gh coc --key citizen_code_of_conduct
  gh coc --key contributor_covenant -o COC.md`
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	if f := cmd.Flags().Lookup("key"); f == nil {
		t.Error("expected --key flag")
	} else if f.DefValue != "" {
		t.Errorf("--key default = %q, want ''", f.DefValue)
	}
	if f := cmd.Flags().Lookup("output"); f == nil {
		t.Error("expected --output flag")
	} else if f.DefValue != "CODE_OF_CONDUCT" {
		t.Errorf("--output default = %q, want 'CODE_OF_CONDUCT'", f.DefValue)
	}
}

func TestNewCommand_RunE(t *testing.T) {
	listBody := `[{"key":"contributor_covenant","name":"Contributor Covenant","url":"https://","body":"# Code of Conduct"}]`
	detailBody := `{"key":"contributor_covenant","name":"Contributor Covenant","url":"https://","body":"# Code of Conduct"}`

	oldFetch := shared.FetchFuncDefault
	shared.FetchFuncDefault = shared.MockFetchSeq(shared.MockResult{Body: []byte(listBody)}, shared.MockResult{Body: []byte(detailBody)})
	defer func() { shared.FetchFuncDefault = oldFetch }()

	cmd := NewCommand()
	cmd.SetArgs([]string{"--key", "contributor_covenant", "--output", "/tmp/test-coc-out.md"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
}
