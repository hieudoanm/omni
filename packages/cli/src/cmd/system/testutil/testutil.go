package testutil

import (
	"io"
	"os"
)

type TestError string

func (e TestError) Error() string { return string(e) }

func CaptureOutput(fn func()) string {
	r, w, _ := os.Pipe()
	orig := os.Stdout
	os.Stdout = w
	fn()
	w.Close()
	out, _ := io.ReadAll(r)
	os.Stdout = orig
	return string(out)
}
