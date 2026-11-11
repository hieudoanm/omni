package internal

import (
	"fmt"
	"regexp"
	"strings"
)

var videoIDPatterns = []*regexp.Regexp{
	regexp.MustCompile(`(?:youtube\.com/watch\?.*v=)([a-zA-Z0-9_-]{11})`),
	regexp.MustCompile(`(?:youtu\.be/)([a-zA-Z0-9_-]{11})`),
	regexp.MustCompile(`(?:youtube\.com/embed/)([a-zA-Z0-9_-]{11})`),
	regexp.MustCompile(`(?:youtube\.com/shorts/)([a-zA-Z0-9_-]{11})`),
	regexp.MustCompile(`^([a-zA-Z0-9_-]{11})$`),
}

func ExtractVideoID(input string) (string, error) {
	input = strings.TrimSpace(input)
	for _, re := range videoIDPatterns {
		if m := re.FindStringSubmatch(input); len(m) > 1 {
			return m[1], nil
		}
	}
	return "", fmt.Errorf("could not extract video ID from: %s", input)
}
