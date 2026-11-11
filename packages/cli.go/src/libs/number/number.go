package number

import (
	"fmt"
	"strconv"
	"strings"
)

// AddZero ...
func AddZero(number int) string {
	if number < 9 {
		return fmt.Sprintf("0%d", number)
	}
	return strconv.Itoa(number)
}

func Comma(n int) string {
	s := strconv.Itoa(n)
	var sign string
	if s[0] == '-' {
		sign = "-"
		s = s[1:]
	}

	nLen := len(s)

	if nLen <= 3 {
		return sign + s
	}

	var b strings.Builder
	pre := nLen % 3
	if pre > 0 {
		b.WriteString(s[:pre])
		if nLen > pre {
			b.WriteString(",")
		}
	}

	for i := pre; i < nLen; i += 3 {
		b.WriteString(s[i : i+3])
		if i+3 < nLen {
			b.WriteString(",")
		}
	}

	return sign + b.String()
}
