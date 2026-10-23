package md

import (
	"fmt"
	"net/url"
	"strings"

	md "github.com/JohannesKaufmann/html-to-markdown/v2"
	"github.com/go-shiori/go-readability"
)

func extractReadable(htmlContent, pageURL string) (title string, contentHTML string, ok bool, err error) {
	u, parseErr := url.Parse(pageURL)
	if parseErr != nil {
		return "", "", false, nil
	}
	article, readErr := readability.FromReader(strings.NewReader(htmlContent), u)
	if readErr != nil {
		return "", "", false, nil
	}
	title = strings.TrimSpace(article.Title)
	content := strings.TrimSpace(article.Content)
	if content == "" || len(content) < 100 {
		return title, "", false, nil
	}
	return title, content, true, nil
}

func convertToMarkdown(htmlContent string) (string, error) {
	markdown, err := md.ConvertString(htmlContent)
	if err != nil {
		return "", fmt.Errorf("convert to markdown: %w", err)
	}
	return markdown, nil
}
