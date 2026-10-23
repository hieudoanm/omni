package serve

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/spf13/cobra"
)

func TestGetCWD(t *testing.T) {
	d := getCWD()
	if d == "" {
		t.Error("expected non-empty CWD")
	}
	wd, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	if d != wd {
		t.Errorf("getCWD() = %q, want %q", d, wd)
	}
}

func TestResetFlags(t *testing.T) {
	cmd := &cobra.Command{Use: "test"}
	cmd.Flags().StringP("name", "n", "default", "name flag")
	cmd.Flags().IntP("count", "c", 42, "count flag")

	if err := cmd.Flags().Set("name", "newname"); err != nil {
		t.Fatal(err)
	}
	if err := cmd.Flags().Set("count", "7"); err != nil {
		t.Fatal(err)
	}

	resetFlags(cmd)

	if v, _ := cmd.Flags().GetString("name"); v != "default" {
		t.Errorf("name = %q, want %q", v, "default")
	}
	if v, _ := cmd.Flags().GetInt("count"); v != 42 {
		t.Errorf("count = %d, want %d", v, 42)
	}
}

func TestResetFlags_inherited(t *testing.T) {
	parent := &cobra.Command{Use: "parent"}
	parent.PersistentFlags().StringP("format", "f", "json", "output format")
	child := &cobra.Command{Use: "child", RunE: func(*cobra.Command, []string) error { return nil }}
	parent.AddCommand(child)

	child.PersistentFlags().StringP("verbose", "v", "false", "verbose")

	child.Flags().Set("format", "yaml")
	child.Flags().Set("verbose", "true")

	resetFlags(child)

	if v, _ := child.Flags().GetString("format"); v != "json" {
		t.Errorf("format = %q, want %q", v, "json")
	}
	if v, _ := child.Flags().GetString("verbose"); v != "false" {
		t.Errorf("verbose = %q, want %q", v, "false")
	}
}

func TestSetFlagValue(t *testing.T) {
	cmd := &cobra.Command{Use: "test"}
	cmd.Flags().Bool("boolflag", false, "a bool")
	cmd.Flags().String("strflag", "", "a string")
	cmd.Flags().Int("intflag", 0, "an int")
	cmd.Flags().Float64("floatflag", 0, "a float")
	cmd.Flags().StringSlice("sliceflag", nil, "a slice")

	bf := cmd.Flag("boolflag")
	sf := cmd.Flag("strflag")
	inf := cmd.Flag("intflag")
	ff := cmd.Flag("floatflag")
	slf := cmd.Flag("sliceflag")

	t.Run("bool", func(t *testing.T) {
		setFlagValue(bf, true)
		v, _ := cmd.Flags().GetBool("boolflag")
		if v != true {
			t.Errorf("bool = %v, want true", v)
		}
		setFlagValue(bf, false)
	})

	t.Run("string", func(t *testing.T) {
		setFlagValue(sf, "hello")
		v, _ := cmd.Flags().GetString("strflag")
		if v != "hello" {
			t.Errorf("str = %q, want %q", v, "hello")
		}
	})

	t.Run("float64 for int flag", func(t *testing.T) {
		setFlagValue(inf, float64(42))
		v, _ := cmd.Flags().GetInt("intflag")
		if v != 42 {
			t.Errorf("int = %d, want %d", v, 42)
		}
	})

	t.Run("float64 for float flag", func(t *testing.T) {
		setFlagValue(ff, float64(3.14))
		v, _ := cmd.Flags().GetFloat64("floatflag")
		if v != 3.14 {
			t.Errorf("float = %f, want %f", v, 3.14)
		}
	})

	t.Run("slice", func(t *testing.T) {
		setFlagValue(slf, []any{"a", "b", "c"})
		v, _ := cmd.Flags().GetStringSlice("sliceflag")
		if len(v) != 3 || v[0] != "a" || v[1] != "b" || v[2] != "c" {
			t.Errorf("slice = %v, want [a b c]", v)
		}
	})

	t.Run("default", func(t *testing.T) {
		setFlagValue(sf, 99)
		v, _ := cmd.Flags().GetString("strflag")
		if v != "99" {
			t.Errorf("default case str = %q, want %q", v, "99")
		}
	})
}

func TestCaptureRun_stdoutOnly(t *testing.T) {
	cmd := &cobra.Command{
		Use: "test",
		RunE: func(*cobra.Command, []string) error {
			fmt.Println("hello from stdout")
			return nil
		},
	}

	stdout, stderr, err := captureRun(cmd, nil)
	if err != nil {
		t.Fatal(err)
	}
	if stderr != "" {
		t.Errorf("unexpected stderr: %q", stderr)
	}
	if stdout != "hello from stdout\n" {
		t.Errorf("stdout = %q, want %q", stdout, "hello from stdout\n")
	}
}

func TestCaptureRun_stderrAndError(t *testing.T) {
	cmd := &cobra.Command{
		Use: "test",
		RunE: func(*cobra.Command, []string) error {
			fmt.Fprintln(os.Stderr, "error msg")
			return fmt.Errorf("something went wrong")
		},
	}

	stdout, stderr, err := captureRun(cmd, nil)
	if err == nil {
		t.Fatal("expected error")
	}
	if err.Error() != "something went wrong" {
		t.Errorf("err = %v, want 'something went wrong'", err)
	}
	if stderr != "error msg\n" {
		t.Errorf("stderr = %q, want %q", stderr, "error msg\n")
	}
	if stdout != "" {
		t.Errorf("unexpected stdout: %q", stdout)
	}
}

func TestCaptureRun_cmdOutput(t *testing.T) {
	cmd := &cobra.Command{
		Use: "test",
		RunE: func(cmd *cobra.Command, args []string) error {
			cmd.Println("from cmd output")
			return nil
		},
	}

	stdout, stderr, err := captureRun(cmd, nil)
	if err != nil {
		t.Fatal(err)
	}
	if stderr != "" {
		t.Errorf("unexpected stderr: %q", stderr)
	}
	if stdout != "from cmd output\n" {
		t.Errorf("stdout = %q, want %q", stdout, "from cmd output\n")
	}
}

func TestExecuteTool_invalidJSON(t *testing.T) {
	cmd := &cobra.Command{
		Use:  "test",
		RunE: func(*cobra.Command, []string) error { return nil },
	}
	result := executeTool(cmd, json.RawMessage(`not json`))
	if !result.IsError {
		t.Error("expected IsError for invalid JSON")
	}
	if len(result.Content) == 0 || result.Content[0].Text == "" {
		t.Error("expected error message in content")
	}
}

func TestExecuteTool_success(t *testing.T) {
	cmd := &cobra.Command{
		Use: "hello",
		RunE: func(cmd *cobra.Command, args []string) error {
			cmd.Println("hello world")
			return nil
		},
	}
	result := executeTool(cmd, json.RawMessage(`{}`))
	if result.IsError {
		t.Errorf("unexpected error: %s", result.Content[0].Text)
	}
	if len(result.Content) == 0 || result.Content[0].Text != "hello world" {
		t.Errorf("content = %+v, want text 'hello world'", result.Content)
	}
}

func TestExecuteTool_withArgs(t *testing.T) {
	cmd := &cobra.Command{
		Use: "echo",
		RunE: func(cmd *cobra.Command, args []string) error {
			for _, a := range args {
				cmd.Println(a)
			}
			return nil
		},
	}
	result := executeTool(cmd, json.RawMessage(`{"_args":["one","two"]}`))
	if result.IsError {
		t.Errorf("unexpected error: %s", result.Content[0].Text)
	}
	if result.Content[0].Text != "one\ntwo" {
		t.Errorf("content = %q, want %q", result.Content[0].Text, "one\ntwo")
	}
}

func TestExecuteTool_withFlags(t *testing.T) {
	cmd := &cobra.Command{
		Use: "greet",
		RunE: func(cmd *cobra.Command, args []string) error {
			name, _ := cmd.Flags().GetString("name")
			count, _ := cmd.Flags().GetInt("count")
			for i := 0; i < count; i++ {
				cmd.Println(name)
			}
			return nil
		},
	}
	cmd.Flags().String("name", "", "name to greet")
	cmd.Flags().Int("count", 1, "number of times")

	result := executeTool(cmd, json.RawMessage(`{"name":"world","count":3}`))
	if result.IsError {
		t.Errorf("unexpected error: %s", result.Content[0].Text)
	}
	if result.Content[0].Text != "world\nworld\nworld" {
		t.Errorf("content = %q, want %q", result.Content[0].Text, "world\nworld\nworld")
	}
}

func TestExecuteTool_unknownFlagSkipped(t *testing.T) {
	cmd := &cobra.Command{
		Use: "noop",
		RunE: func(cmd *cobra.Command, args []string) error {
			return nil
		},
	}
	result := executeTool(cmd, json.RawMessage(`{"nonexistent":"value"}`))
	if result.IsError {
		t.Errorf("unexpected error: %s", result.Content[0].Text)
	}
}

func TestExecuteTool_errorResult(t *testing.T) {
	cmd := &cobra.Command{
		Use: "fail",
		RunE: func(cmd *cobra.Command, args []string) error {
			return fmt.Errorf("command failed")
		},
	}
	result := executeTool(cmd, json.RawMessage(`{}`))
	if !result.IsError {
		t.Fatal("expected IsError")
	}
	if result.Content[0].Text != "command failed" {
		t.Errorf("text = %q, want %q", result.Content[0].Text, "command failed")
	}
}

func TestExecuteTool_errorWithOutput(t *testing.T) {
	cmd := &cobra.Command{
		Use: "partial",
		RunE: func(cmd *cobra.Command, args []string) error {
			cmd.Println("before error")
			return fmt.Errorf("something broke")
		},
	}
	result := executeTool(cmd, json.RawMessage(`{}`))
	if !result.IsError {
		t.Fatal("expected IsError")
	}
	if result.Content[0].Text != "before error" {
		t.Errorf("text = %q, want %q", result.Content[0].Text, "before error")
	}
}

func TestExecuteTool_resetFlagsBetweenCalls(t *testing.T) {
	cmd := &cobra.Command{
		Use: "counter",
		RunE: func(cmd *cobra.Command, args []string) error {
			v, _ := cmd.Flags().GetString("val")
			cmd.Println(v)
			return nil
		},
	}
	cmd.Flags().String("val", "default", "a value")

	r1 := executeTool(cmd, json.RawMessage(`{"val":"first"}`))
	if r1.IsError {
		t.Fatal("first call failed:", r1.Content[0].Text)
	}
	if r1.Content[0].Text != "first" {
		t.Errorf("first call text = %q, want %q", r1.Content[0].Text, "first")
	}

	r2 := executeTool(cmd, json.RawMessage(`{}`))
	if r2.IsError {
		t.Fatal("second call failed:", r2.Content[0].Text)
	}
	if r2.Content[0].Text != "default" {
		t.Errorf("second call text = %q, want %q (should be default after reset)", r2.Content[0].Text, "default")
	}
}

// A tool writing more than the pipe buffer would deadlock the server if the
// pipes were only drained after RunE returned.
func TestCaptureRun_largeOutputDoesNotDeadlock(t *testing.T) {
	large := strings.Repeat("x", 1<<20) // 1 MiB, well past the 64 KiB pipe buffer

	cmd := &cobra.Command{Use: "big"}
	cmd.RunE = func(c *cobra.Command, args []string) error {
		fmt.Fprint(os.Stdout, large)
		return nil
	}

	done := make(chan struct{})
	var stdout string
	var err error
	go func() {
		defer close(done)
		stdout, _, err = captureRun(cmd, nil)
	}()

	select {
	case <-done:
	case <-time.After(10 * time.Second):
		t.Fatal("captureRun deadlocked on output larger than the pipe buffer")
	}

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(stdout) != len(large) {
		t.Fatalf("expected %d bytes, got %d", len(large), len(stdout))
	}
}
