package archive

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

func runE(args []string, action, output string) error {
	switch action {
	case "create":
		return runCreate(args, output)
	case "extract":
		if len(args) != 1 {
			return fmt.Errorf("extract requires exactly one argument: the zip file")
		}
		return runExtract(args[0], output)
	default:
		return fmt.Errorf("unknown action: %s (use create or extract)", action)
	}
}

func runCreate(files []string, output string) error {
	if len(files) == 0 {
		return fmt.Errorf("at least one file required")
	}

	if output == "" {
		output = "archive.zip"
	}
	if filepath.Ext(output) == "" {
		output += ".zip"
	}

	f, err := os.Create(output)
	if err != nil {
		return fmt.Errorf("create archive: %w", err)
	}
	defer f.Close()

	writer := zip.NewWriter(f)
	defer writer.Close()

	for _, file := range files {
		info, err := os.Stat(file)
		if err != nil {
			return fmt.Errorf("stat %s: %w", file, err)
		}
		if info.IsDir() {
			return fmt.Errorf("directories not supported: %s", file)
		}

		fh, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}
		fh.Name = filepath.Base(file)
		fh.Method = zip.Deflate

		w, err := writer.CreateHeader(fh)
		if err != nil {
			return err
		}

		in, err := os.Open(file)
		if err != nil {
			return fmt.Errorf("open %s: %w", file, err)
		}
		_, err = io.Copy(w, in)
		in.Close()
		if err != nil {
			return fmt.Errorf("write %s: %w", file, err)
		}
	}

	fmt.Printf("Created: %s\n", output)
	return nil
}

func runExtract(zipFile, output string) error {
	reader, err := zip.OpenReader(zipFile)
	if err != nil {
		return fmt.Errorf("open zip: %w", err)
	}
	defer reader.Close()

	if output == "" {
		output = "."
	}

	for _, f := range reader.File {
		path := filepath.Join(output, f.Name)

		if f.FileInfo().IsDir() {
			os.MkdirAll(path, 0755)
			continue
		}

		if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
			return err
		}

		out, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return fmt.Errorf("create %s: %w", path, err)
		}

		in, err := f.Open()
		if err != nil {
			out.Close()
			return fmt.Errorf("read %s: %w", f.Name, err)
		}

		_, err = io.Copy(out, in)
		in.Close()
		out.Close()
		if err != nil {
			return fmt.Errorf("write %s: %w", path, err)
		}

		fmt.Printf("Extracted: %s\n", path)
	}

	return nil
}
