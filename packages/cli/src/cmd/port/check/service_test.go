package check

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/port/testutil"
)

func TestOutputCheckResult_Open(t *testing.T) {
	out := testutil.CaptureOutput(func() {
		outputCheckResult("localhost:8080", true, false)
	})
	if !strings.Contains(out, "is open") {
		t.Errorf("expected open message, got: %s", out)
	}
}

func TestOutputCheckResult_Closed(t *testing.T) {
	out := testutil.CaptureOutput(func() {
		outputCheckResult("localhost:8080", false, false)
	})
	if !strings.Contains(out, "is closed") {
		t.Errorf("expected closed message, got: %s", out)
	}
}

func TestOutputCheckResult_JSON(t *testing.T) {
	out := testutil.CaptureOutput(func() {
		outputCheckResult("localhost:8080", true, true)
	})
	if !strings.Contains(out, `"open": true`) {
		t.Errorf("expected JSON with open=true, got: %s", out)
	}
}

func TestOutputCheckResult_JSONClosed(t *testing.T) {
	out := testutil.CaptureOutput(func() {
		outputCheckResult("127.0.0.1:3000", false, true)
	})
	if !strings.Contains(out, `"open": false`) {
		t.Errorf("expected JSON with open=false, got: %s", out)
	}
}
