package version

import (
	"fmt"
	"strconv"
	"strings"
)

type Version struct {
	Major, Minor, Patch int
	Prerelease          string
}

func Parse(s string) (Version, error) {
	s = strings.TrimPrefix(s, "v")
	parts := strings.SplitN(s, ".", 3)
	if len(parts) < 3 {
		return Version{}, fmt.Errorf("invalid semver: %s (need major.minor.patch)", s)
	}
	major, err := strconv.Atoi(parts[0])
	if err != nil {
		return Version{}, fmt.Errorf("invalid major version: %s", parts[0])
	}
	minor, err := strconv.Atoi(parts[1])
	if err != nil {
		return Version{}, fmt.Errorf("invalid minor version: %s", parts[1])
	}

	patchStr := parts[2]
	var prerelease string
	if idx := strings.Index(patchStr, "-"); idx >= 0 {
		prerelease = patchStr[idx+1:]
		patchStr = patchStr[:idx]
	}

	patch, err := strconv.Atoi(patchStr)
	if err != nil {
		return Version{}, fmt.Errorf("invalid patch version: %s", patchStr)
	}
	return Version{major, minor, patch, prerelease}, nil
}

func (v Version) String() string {
	s := fmt.Sprintf("%d.%d.%d", v.Major, v.Minor, v.Patch)
	if v.Prerelease != "" {
		s += "-" + v.Prerelease
	}
	return s
}

func (a Version) Compare(b Version) int {
	if a.Major != b.Major {
		return a.Major - b.Major
	}
	if a.Minor != b.Minor {
		return a.Minor - b.Minor
	}
	if a.Patch != b.Patch {
		return a.Patch - b.Patch
	}
	if a.Prerelease != b.Prerelease {
		if a.Prerelease == "" {
			return 1
		}
		if b.Prerelease == "" {
			return -1
		}
		if a.Prerelease < b.Prerelease {
			return -1
		}
		return 1
	}
	return 0
}

func (v Version) Bump(part string) Version {
	switch part {
	case "major":
		return Version{v.Major + 1, 0, 0, ""}
	case "minor":
		return Version{v.Major, v.Minor + 1, 0, ""}
	case "patch":
		return Version{v.Major, v.Minor, v.Patch + 1, ""}
	default:
		return v
	}
}

func CheckRange(v Version, rangeExpr string) (bool, error) {
	parts := strings.Fields(rangeExpr)
	if len(parts) == 0 {
		return false, fmt.Errorf("empty range expression")
	}

	for i := 0; i < len(parts); i += 2 {
		op := parts[i]
		if i+1 >= len(parts) {
			return false, fmt.Errorf("incomplete range: missing version after %s", op)
		}
		ver, err := Parse(parts[i+1])
		if err != nil {
			return false, fmt.Errorf("invalid version in range: %s", parts[i+1])
		}

		switch op {
		case ">":
			if v.Compare(ver) <= 0 {
				return false, nil
			}
		case ">=":
			if v.Compare(ver) < 0 {
				return false, nil
			}
		case "<":
			if v.Compare(ver) >= 0 {
				return false, nil
			}
		case "<=":
			if v.Compare(ver) > 0 {
				return false, nil
			}
		case "=", "==":
			if v.Compare(ver) != 0 {
				return false, nil
			}
		default:
			return false, fmt.Errorf("unknown operator: %s", op)
		}
	}

	return true, nil
}
