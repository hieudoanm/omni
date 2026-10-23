package write

import (
	"os"

	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var appendMode bool
	var mkdir bool
	var permMode, path, content string

	cmd := &cobra.Command{
		Use:   "write [--file <path>] [--content <text>]",
		Short: "Write or append content to a file",
		Long:  `Write content to a file. Content can be provided via --content flag or piped via stdin.`,
		Example: `  file write -f hello.txt -c "Hello, World!"
  file write --file hello.txt      (reads from stdin)
  file write -f log.txt -c "new log entry" --append
  file write -f newdir/file.txt --mkdir -c "content"
  echo "data" | file write -f output.txt`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")

			content, err := getWriteContent(content)
			if err != nil {
				return err
			}

			flag, mode, err := openFileForWrite(path, appendMode, mkdir, permMode)
			if err != nil {
				return err
			}

			f, err := os.OpenFile(path, flag, mode)
			if err != nil {
				return err
			}
			defer f.Close()

			n, err := f.WriteString(content)
			if err != nil {
				return err
			}

			return outputWriteResult(path, n, appendMode, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&path, "file", "f", "", "File path")
	cmd.Flags().StringVarP(&content, "content", "c", "", "File content (omit to read from stdin)")
	cmd.Flags().BoolVarP(&appendMode, "append", "a", false, "Append to file instead of overwriting")
	cmd.Flags().BoolVarP(&mkdir, "mkdir", "p", false, "Create parent directories if needed")
	cmd.Flags().StringVarP(&permMode, "mode", "m", "", "File permissions (octal, e.g. 644)")
	return cmd
}
