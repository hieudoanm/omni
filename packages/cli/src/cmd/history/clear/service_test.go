package clear

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/history/testutil"
	"github.com/hieudoanm/omni/packages/cli/src/libs/history"
)

func TestRunClear(t *testing.T) {
	testutil.SetHomeTempDir(t)

	if err := history.Append(history.Entry{Timestamp: "now", Source: "cli", Command: "test"}); err != nil {
		t.Fatal(err)
	}

	if err := runClear(false); err != nil {
		t.Fatal(err)
	}

	entries, _ := history.List(10)
	if len(entries) != 0 {
		t.Errorf("expected 0 entries after clear, got %d", len(entries))
	}
}

func TestRunClear_Empty(t *testing.T) {
	testutil.SetHomeTempDir(t)

	if err := runClear(false); err != nil {
		t.Fatal(err)
	}
}
