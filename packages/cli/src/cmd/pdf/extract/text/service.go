package text

import (
	"bytes"
	"context"
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

	ctx := context.Background()
	conf, err := api.LoadConfiguration(api.ConfigurationOptions{})
	if err != nil {
		return fmt.Errorf("cannot load config: %w", err)
	}
	var collector textCollector

	digest := func(r io.Reader, pageNr int) error {
		_, err := io.Copy(&collector, r)
		return err
	}

	if err := api.ExtractContent(ctx, f, nil, digest, conf); err != nil {
		return fmt.Errorf("text extraction failed: %w", err)
	}

	fmt.Fprint(cmd.OutOrStdout(), collector.buf.String())
	return nil
}
