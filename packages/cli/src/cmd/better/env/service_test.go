package env

import (
	"bytes"
	"io"
	"os"
	"strings"
	"sync"
	"testing"
)

func captureOutput(fn func()) string {
	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w

	var buf bytes.Buffer
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		io.Copy(&buf, r)
	}()

	fn()

	w.Close()
	wg.Wait()
	os.Stdout = orig

	return buf.String()
}

func TestRun(t *testing.T) {
	t.Setenv("BETTER_TEST_VAR", "hello")

	output := captureOutput(func() {
		if err := run("", "key", false); err != nil {
			t.Fatal(err)
		}
	})

	if !strings.Contains(output, "BETTER_TEST_VAR") || !strings.Contains(output, "hello") {
		t.Errorf("expected test var in output, got:\n%s", output)
	}
}

func TestRunNameFilter(t *testing.T) {
	t.Setenv("BETTER_FOO", "bar")
	t.Setenv("BETTER_BAR", "baz")

	output := captureOutput(func() {
		if err := run("FOO", "key", false); err != nil {
			t.Fatal(err)
		}
	})

	if !strings.Contains(output, "BETTER_FOO") {
		t.Errorf("expected BETTER_FOO in output, got:\n%s", output)
	}
	if strings.Contains(output, "BETTER_BAR") {
		t.Errorf("did not expect BETTER_BAR in filtered output, got:\n%s", output)
	}
}

func TestRunJSON(t *testing.T) {
	t.Setenv("BETTER_JSON_VAR", "json_val")

	output := captureOutput(func() {
		if err := run("", "key", true); err != nil {
			t.Fatal(err)
		}
	})

	if !strings.Contains(output, `"key": "BETTER_JSON_VAR"`) {
		t.Errorf("expected JSON with key, got:\n%s", output)
	}
	if !strings.Contains(output, `"count"`) {
		t.Errorf("expected count field, got:\n%s", output)
	}
}

func TestRunSortByValue(t *testing.T) {
	t.Setenv("BETA", "zzz")
	t.Setenv("ALPHA", "aaa")

	output := captureOutput(func() {
		if err := run("", "value", false); err != nil {
			t.Fatal(err)
		}
	})

	aIdx := strings.Index(output, "aaa")
	zIdx := strings.Index(output, "zzz")
	if aIdx < 0 || zIdx < 0 {
		t.Errorf("expected both values in output, got:\n%s", output)
	}
	if aIdx > zIdx {
		t.Errorf("expected 'aaa' before 'zzz' when sorting by value, got:\n%s", output)
	}
}

func TestPrintTable(t *testing.T) {
	output := captureOutput(func() {
		if err := printTable([]string{"KEY", "VALUE"}, [][]string{{"HOME", "/home"}}); err != nil {
			t.Fatal(err)
		}
	})

	if !strings.Contains(output, "KEY") || !strings.Contains(output, "VALUE") {
		t.Errorf("expected headers in output, got:\n%s", output)
	}
}
