package internal

import (
	"os"
	"path/filepath"
)

type File struct {
	AbsPath string
	RelPath string
	Lang    Language
}

type Language string

const (
	LangGo         Language = "go"
	LangTypeScript Language = "typescript"
	LangJavaScript Language = "javascript"
	LangPython     Language = "python"
	LangRust       Language = "rust"
	LangUnknown    Language = "unknown"
)

var extLang = map[string]Language{
	".go":  LangGo,
	".ts":  LangTypeScript,
	".tsx": LangTypeScript,
	".js":  LangJavaScript,
	".jsx": LangJavaScript,
	".py":  LangPython,
	".rs":  LangRust,
}

func Walk(root string, exclude map[string]bool) ([]File, error) {
	var files []File

	err := filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}

		name := d.Name()

		if name != "." && (name[0] == '.' || exclude[name]) {
			if d.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		if d.IsDir() {
			return nil
		}

		ext := filepath.Ext(name)
		lang, ok := extLang[ext]
		if !ok {
			return nil
		}

		rel, err := filepath.Rel(root, path)
		if err != nil {
			rel = path
		}

		files = append(files, File{
			AbsPath: path,
			RelPath: rel,
			Lang:    lang,
		})
		return nil
	})

	return files, err
}
