package shared

import (
	"os"
	"path/filepath"
	"testing"
)

func TestWalkWithDepth(t *testing.T) {
	dir := t.TempDir()

	os.MkdirAll(filepath.Join(dir, "a", "b", "c"), 0755)
	os.WriteFile(filepath.Join(dir, "a", "f1.txt"), []byte("x"), 0644)
	os.WriteFile(filepath.Join(dir, "a", "b", "f2.txt"), []byte("x"), 0644)
	os.WriteFile(filepath.Join(dir, "a", "b", "c", "f3.txt"), []byte("x"), 0644)

	var visited []string
	WalkWithDepth(dir, 0, 2, func(path string, fi os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		rel, _ := filepath.Rel(dir, path)
		visited = append(visited, rel)
		return nil
	})

	var hasDeepFile bool
	for _, v := range visited {
		if v == filepath.Join("a", "b", "c", "f3.txt") {
			hasDeepFile = true
			break
		}
	}
	if hasDeepFile {
		t.Error("WalkWithDepth depth=2 should not reach depth 3 files")
	}
}

func TestWalkWithDepthMaxDepth0(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "sub"), 0755)
	os.WriteFile(filepath.Join(dir, "root.txt"), []byte("a"), 0644)

	var visited []string
	WalkWithDepth(dir, 0, 0, func(path string, fi os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		rel, _ := filepath.Rel(dir, path)
		visited = append(visited, rel)
		return nil
	})

	if len(visited) != 1 || visited[0] != "." {
		t.Errorf("expected only root (.), got %v", visited)
	}
}

func TestWalkWithDepthStatError(t *testing.T) {
	var visited []string
	WalkWithDepth("/nonexistent", 0, 2, func(path string, fi os.FileInfo, err error) error {
		if err != nil {
			visited = append(visited, "stat-error")
		}
		return nil
	})
	if len(visited) == 0 {
		t.Error("expected at least error callback")
	}
}

func TestWalkWithDepthFilesOnly(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "a.txt"), []byte("x"), 0644)
	os.WriteFile(filepath.Join(dir, "b.txt"), []byte("y"), 0644)

	var visited []string
	WalkWithDepth(dir, 0, 1, func(path string, fi os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if !fi.IsDir() {
			rel, _ := filepath.Rel(dir, path)
			visited = append(visited, rel)
		}
		return nil
	})

	if len(visited) != 2 {
		t.Errorf("expected 2 files, got %d: %v", len(visited), visited)
	}
}

func TestWalkWithDepth_ReadDirError(t *testing.T) {
	dir := t.TempDir()
	sub := filepath.Join(dir, "subdir")
	os.Mkdir(sub, 0755)
	os.Chmod(sub, 0000)
	t.Cleanup(func() { os.Chmod(sub, 0755) })

	var errVisited bool
	WalkWithDepth(dir, 0, 2, func(path string, fi os.FileInfo, err error) error {
		if err != nil {
			errVisited = true
		}
		return nil
	})
	if !errVisited {
		t.Error("expected error callback for unreadable subdirectory")
	}
}

func TestWalkWithDepth_EntryInfoError(t *testing.T) {
	dir := t.TempDir()
	noexec := filepath.Join(dir, "noexec")
	os.Mkdir(noexec, 0755)
	os.WriteFile(filepath.Join(noexec, "file.txt"), []byte("x"), 0644)
	os.Chmod(noexec, 0400)
	t.Cleanup(func() { os.Chmod(noexec, 0755) })

	var infoErrVisited bool
	WalkWithDepth(dir, 0, 2, func(path string, fi os.FileInfo, err error) error {
		if fi == nil && err != nil {
			infoErrVisited = true
		}
		return nil
	})
	if !infoErrVisited {
		t.Error("expected error callback for entry in no-exec directory")
	}
}

func TestWalkWithDepthMaxDepth1(t *testing.T) {
	dir := t.TempDir()
	os.MkdirAll(filepath.Join(dir, "sub"), 0755)
	os.WriteFile(filepath.Join(dir, "root.txt"), []byte("a"), 0644)
	os.WriteFile(filepath.Join(dir, "sub", "deep.txt"), []byte("b"), 0644)

	var visited []string
	WalkWithDepth(dir, 0, 1, func(path string, fi os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if !fi.IsDir() {
			rel, _ := filepath.Rel(dir, path)
			visited = append(visited, rel)
		}
		return nil
	})

	if len(visited) != 1 || visited[0] != "root.txt" {
		t.Errorf("expected only root.txt, got %v", visited)
	}
}
