package internal

import "regexp"

var doiRe = regexp.MustCompile(`^10\.\d{4,}/.+$`)

func IsValidDOI(id string) bool {
	return doiRe.MatchString(id)
}
