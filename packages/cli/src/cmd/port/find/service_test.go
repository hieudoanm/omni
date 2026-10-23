package find

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/port/testutil"
)

func TestOutputFindResult_Text(t *testing.T) {
	out := testutil.CaptureOutput(func() {
		outputFindResult(3000, false)
	})
	if !strings.Contains(out, "Available port: 3000") {
		t.Errorf("expected 'Available port: 3000', got: %s", out)
	}
}

func TestOutputFindResult_JSON(t *testing.T) {
	out := testutil.CaptureOutput(func() {
		outputFindResult(3000, true)
	})
	if !strings.Contains(out, `"port": 3000`) {
		t.Errorf("expected JSON with port 3000, got: %s", out)
	}
}

func TestFindAvailablePort_Success(t *testing.T) {
	port, err := findAvailablePort(50000, 50010)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if port < 50000 || port > 50010 {
		t.Errorf("port %d out of range [50000, 50010]", port)
	}
}
