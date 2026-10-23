package web

import (
	"encoding/json"
	"fmt"
	"net/url"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"golang.org/x/net/html"
)

type webResult struct {
	Title   string `json:"title"`
	URL     string `json:"url"`
	Snippet string `json:"snippet"`
}

func outputWebResults(results []webResult, query string, jsonOutput bool) error {
	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"query":   query,
			"results": results,
			"count":   len(results),
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
		return nil
	}

	if len(results) == 0 {
		fmt.Println("(no results)")
		return nil
	}

	for i, r := range results {
		fmt.Printf("%d. %s\n", i+1, r.Title)
		fmt.Printf("   %s\n", r.URL)
		if r.Snippet != "" {
			fmt.Printf("   %s\n", r.Snippet)
		}
		fmt.Println()
	}
	fmt.Printf("%d results from DuckDuckGo\n", len(results))
	return nil
}

func duckDuckGoSearch(query string, maxResults int, jsonOutput bool) error {
	searchURL := fmt.Sprintf("https://lite.duckduckgo.com/lite/?q=%s", url.QueryEscape(query))

	body, err := requests.Get(searchURL, requests.Options{})
	if err != nil {
		return fmt.Errorf("fetch error: %w", err)
	}

	results := parseDuckDuckGoResults(string(body), maxResults)
	return outputWebResults(results, query, jsonOutput)
}

func parseDuckDuckGoResults(htmlStr string, maxResults int) []webResult {
	doc, err := html.Parse(strings.NewReader(htmlStr))
	if err != nil {
		return nil
	}

	var results []webResult
	var current webResult
	var inLink, inSnippet bool

	var f func(*html.Node)
	f = func(n *html.Node) {
		if n.Type == html.ElementNode {
			if n.Data == "a" {
				for _, attr := range n.Attr {
					if attr.Key == "class" && attr.Val == "result-link" {
						inLink = true
						for _, a := range n.Attr {
							if a.Key == "href" {
								current.URL = a.Val
								break
							}
						}
						break
					}
				}
			}

			if n.Data == "td" {
				for _, attr := range n.Attr {
					if attr.Key == "class" && attr.Val == "result-snippet" {
						inSnippet = true
						break
					}
				}
			}
		}

		if n.Type == html.TextNode {
			if inLink {
				current.Title += n.Data
			}
			if inSnippet {
				current.Snippet += n.Data
			}
		}

		for c := n.FirstChild; c != nil; c = c.NextSibling {
			f(c)
		}

		if n.Type == html.ElementNode {
			if inLink && n.Data == "a" {
				inLink = false
				if current.Title != "" {
					current.Title = strings.TrimSpace(current.Title)
					if !strings.HasPrefix(current.URL, "http") {
						if strings.HasPrefix(current.URL, "//") {
							current.URL = "https:" + current.URL
						} else {
							current.URL = "https://" + current.URL
						}
					}
					results = append(results, current)
					current = webResult{}
				}
			}
			if inSnippet && n.Data == "td" {
				inSnippet = false
				if len(results) > 0 {
					results[len(results)-1].Snippet = strings.TrimSpace(current.Snippet)
				}
				current.Snippet = ""
			}
		}
	}
	f(doc)

	if maxResults > 0 && maxResults < len(results) {
		results = results[:maxResults]
	}

	return results
}
