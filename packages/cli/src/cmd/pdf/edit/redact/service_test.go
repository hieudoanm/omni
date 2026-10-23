package redact

import (
	"testing"

	"github.com/spf13/cobra"
)

func executeCommand(cmd *cobra.Command, args ...string) error {
	cmd.SetArgs(args)
	return cmd.Execute()
}

func TestParseRegion_Valid(t *testing.T) {
	r, err := parseRegion("1:10,20,300,400")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if r.page != 1 || r.x != 10 || r.y != 20 || r.w != 300 || r.h != 400 {
		t.Errorf("got %+v", r)
	}
}

func TestParseRegion_MissingColon(t *testing.T) {
	_, err := parseRegion("1,10,20,300,400")
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestParseRegion_BadPage(t *testing.T) {
	_, err := parseRegion("abc:10,20,300,400")
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestParseRegion_WrongCoords(t *testing.T) {
	_, err := parseRegion("1:10,20")
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestParseRegion_BadCoord(t *testing.T) {
	_, err := parseRegion("1:abc,20,300,400")
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestRun_MissingFile(t *testing.T) {
	cmd := NewCommand()
	err := executeCommand(cmd, "/nonexistent/file.pdf")
	if err == nil {
		t.Fatal("expected error")
	}
}

func TestRun_NoFlags(t *testing.T) {
	cmd := NewCommand()
	err := executeCommand(cmd, "test.pdf")
	if err == nil {
		t.Fatal("expected error for missing --pages or --region")
	}
}

func TestRun_BothFlags(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"test.pdf", "--pages", "1", "--region", "1:0,0,10,10"})
	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for using both flags")
	}
}

func TestRun_WithPages(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"/nonexistent/file.pdf", "--pages", "1"})
	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for missing file")
	}
}

func TestRun_WithRegion(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"/nonexistent/file.pdf", "-r", "1:0,0,10,10"})
	err := cmd.Execute()
	if err == nil {
		t.Fatal("expected error for missing file")
	}
}
