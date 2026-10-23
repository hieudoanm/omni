package edit

import (
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/file/internal"
)

func pluralS(n int) string {
	if n == 1 {
		return ""
	}
	return "s"
}

func showDiff(before, after string) {
	beforeLines := internal.SplitLines(before)
	afterLines := internal.SplitLines(after)

	maxLen := len(beforeLines)
	if len(afterLines) > maxLen {
		maxLen = len(afterLines)
	}

	for i := 0; i < maxLen; i++ {
		var bLine, aLine string
		if i < len(beforeLines) {
			bLine = beforeLines[i]
		}
		if i < len(afterLines) {
			aLine = afterLines[i]
		}
		if bLine != aLine {
			fmt.Printf("- %s\n", bLine)
			fmt.Printf("+ %s\n", aLine)
		} else {
			fmt.Printf("  %s\n", bLine)
		}
	}
}

func buildDiff(before, after string) string {
	var b strings.Builder
	beforeLines := internal.SplitLines(before)
	afterLines := internal.SplitLines(after)

	maxLen := len(beforeLines)
	if len(afterLines) > maxLen {
		maxLen = len(afterLines)
	}

	for i := 0; i < maxLen; i++ {
		var bLine, aLine string
		if i < len(beforeLines) {
			bLine = beforeLines[i]
		}
		if i < len(afterLines) {
			aLine = afterLines[i]
		}
		if bLine != aLine {
			if bLine != "" {
				b.WriteString("- " + bLine + "\n")
			}
			if aLine != "" {
				b.WriteString("+ " + aLine + "\n")
			}
		}
	}
	return strings.TrimRight(b.String(), "\n")
}
