package text

import (
	"bytes"
	"fmt"
	"io"
	"os"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/spf13/cobra"
)

type textCollector struct {
	buf bytes.Buffer
}

func (c *textCollector) Write(p []byte) (int, error) {
	return c.buf.Write(p)
}

func run(cmd *cobra.Command, file string) error {
	f, err := os.Open(file)
	if err != nil {
		return fmt.Errorf("cannot open %s: %w", file, err)
	}
	defer f.Close()

	conf := api.LoadConfiguration()
	var collector textCollector

	digest := func(r io.Reader, pageNr int) error {
		_, err := io.Copy(&collector, r)
		return err
	}

	if err := api.ExtractContent(f, nil, digest, conf); err != nil {
		return fmt.Errorf("text extraction failed: %w", err)
	}

	fmt.Fprint(cmd.OutOrStdout(), collector.buf.String())
	return nil
}
