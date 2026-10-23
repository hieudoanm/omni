package write

import (
	"os"
	"path/filepath"
	"testing"
)

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "write [--file <path>] [--content <text>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Args != nil {
		t.Error("Args should not be set")
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	_, err := cmd.Flags().GetString("file")
	if err != nil {
		t.Error("expected --file flag")
	}
	_, err = cmd.Flags().GetString("content")
	if err != nil {
		t.Error("expected --content flag")
	}
	_, err = cmd.Flags().GetBool("append")
	if err != nil {
		t.Error("expected --append flag")
	}
	_, err = cmd.Flags().GetBool("mkdir")
	if err != nil {
		t.Error("expected --mkdir flag")
	}
	_, err = cmd.Flags().GetString("mode")
	if err != nil {
		t.Error("expected --mode flag")
	}
}

func TestWriteToFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "test.txt")

	cmd := NewCommand()
	cmd.SetArgs([]string{"--file", path, "--content", "hello world"})
	err := cmd.Execute()
	if err != nil {
		t.Fatal(err)
	}

	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != "hello world" {
		t.Errorf("content = %q, want %q", string(data), "hello world")
	}
}

func TestWriteAppend(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "append.txt")

	os.WriteFile(path, []byte("first\n"), 0644)

	cmd := NewCommand()
	cmd.SetArgs([]string{"--file", path, "--content", "second", "--append"})
	err := cmd.Execute()
	if err != nil {
		t.Fatal(err)
	}

	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	want := "first\nsecond"
	if string(data) != want {
		t.Errorf("content = %q, want %q", string(data), want)
	}
}

func TestWriteMkdir(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "sub", "nested", "file.txt")

	cmd := NewCommand()
	cmd.SetArgs([]string{"--file", path, "--content", "content", "--mkdir"})
	err := cmd.Execute()
	if err != nil {
		t.Fatal(err)
	}

	if _, err := os.Stat(path); os.IsNotExist(err) {
		t.Error("file was not created")
	}
}

func TestWriteErrorOnNoContent(t *testing.T) {
	cmd := NewCommand()
	cmd.SetArgs([]string{"--file", "/tmp/nonexistent/file.txt"})
	err := cmd.Execute()
	if err == nil {
		t.Error("expected error when no content provided and not piped")
	}
}
