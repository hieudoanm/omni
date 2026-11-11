package edit

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strings"
)

func performEdit(content, old, newStr string, useRegex bool, count int) (string, int, error) {
	var matchCount int

	if useRegex {
		re, err := regexp.Compile(old)
		if err != nil {
			return "", 0, fmt.Errorf("invalid regex %q: %w", old, err)
		}
		if count > 0 {
			var replaced string
			matchCount = 0
			replaced = re.ReplaceAllStringFunc(content, func(m string) string {
				if matchCount < count {
					matchCount++
					return newStr
				}
				return m
			})
			return replaced, matchCount, nil
		}
		matchCount = len(re.FindAllString(content, -1))
		return re.ReplaceAllString(content, newStr), matchCount, nil
	}

	matchCount = strings.Count(content, old)
	if count > 0 && count < matchCount {
		matchCount = count
	}
	if count > 0 {
		return strings.Replace(content, old, newStr, count), matchCount, nil
	}
	return strings.Replace(content, old, newStr, -1), matchCount, nil
}

func outputEditResult(path, content, replaced string, matchCount int, preview bool, mode os.FileMode, jsonOutput bool) error {
	if matchCount == 0 {
		if jsonOutput {
			out, err := json.MarshalIndent(map[string]interface{}{
				"file":    path,
				"matches": 0,
			}, "", "  ")
			if err != nil {
				return err
			}
			fmt.Println(string(out))
		} else {
			fmt.Printf("No matches found in %s\n", path)
		}
		return nil
	}

	if preview {
		if jsonOutput {
			diff := buildDiff(content, replaced)
			out, err := json.MarshalIndent(map[string]interface{}{
				"file":    path,
				"matches": matchCount,
				"diff":    diff,
			}, "", "  ")
			if err != nil {
				return err
			}
			fmt.Println(string(out))
		} else {
			fmt.Printf("── Preview for %s (%d match%s) ──\n", path, matchCount, pluralS(matchCount))
			showDiff(content, replaced)
		}
		return nil
	}

	if err := os.WriteFile(path, []byte(replaced), mode); err != nil {
		return fmt.Errorf("error writing %s: %w", path, err)
	}

	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"file":    path,
			"matches": matchCount,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		fmt.Printf("Replaced %d occurrence%s in %s\n", matchCount, pluralS(matchCount), path)
	}
	return nil
}
