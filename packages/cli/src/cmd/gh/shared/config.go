package shared

import "os"

func GithubToken() string {
	return os.Getenv("GITHUB_TOKEN")
}
