package internal

import (
	"fmt"
	"math"
	"math/rand/v2"
	"regexp"
	"strconv"
	"strings"
)

type Hex string

func (h Hex) ToRGB() (r, g, b int, err error) {
	hex := strings.TrimPrefix(string(h), "#")
	if len(hex) == 3 {
		hex = fmt.Sprintf("%c%c%c%c%c%c", hex[0], hex[0], hex[1], hex[1], hex[2], hex[2])
	}
	if len(hex) != 6 {
		return 0, 0, 0, fmt.Errorf("invalid hex length")
	}
	r64, err := strconv.ParseInt(hex[0:2], 16, 0)
	if err != nil {
		return 0, 0, 0, err
	}
	g64, err := strconv.ParseInt(hex[2:4], 16, 0)
	if err != nil {
		return 0, 0, 0, err
	}
	b64, err := strconv.ParseInt(hex[4:6], 16, 0)
	if err != nil {
		return 0, 0, 0, err
	}
	return int(r64), int(g64), int(b64), nil
}

func (h Hex) ToHSL() (H, S, L float64, err error) {
	rInt, gInt, bInt, err := h.ToRGB()
	if err != nil {
		return 0, 0, 0, err
	}
	r := float64(rInt) / 255
	g := float64(gInt) / 255
	b := float64(bInt) / 255
	max := math.Max(r, math.Max(g, b))
	min := math.Min(r, math.Min(g, b))
	L = (max + min) / 2
	if max == min {
		H, S = 0, 0
	} else {
		d := max - min
		if L > 0.5 {
			S = d / (2 - max - min)
		} else {
			S = d / (max + min)
		}
		switch max {
		case r:
			H = (g - b) / d
			if g < b {
				H += 6
			}
		case g:
			H = (b-r)/d + 2
		case b:
			H = (r-g)/d + 4
		}
		H *= 60
	}
	S *= 100
	L *= 100
	return H, S, L, nil
}

func (h Hex) ToOKLCH() (L, C, H float64, err error) {
	rInt, gInt, bInt, err := h.ToRGB()
	if err != nil {
		return 0, 0, 0, err
	}
	toLinear := func(c float64) float64 {
		c = c / 255
		if c <= 0.04045 {
			return c / 12.92
		}
		return math.Pow((c+0.055)/1.055, 2.4)
	}
	r := toLinear(float64(rInt))
	g := toLinear(float64(gInt))
	b := toLinear(float64(bInt))
	l_ := 0.4122214708*r + 0.5363325363*g + 0.0514459929*b
	m_ := 0.2119034982*r + 0.6806995451*g + 0.1073969566*b
	s_ := 0.0883024619*r + 0.2817188376*g + 0.6299787005*b
	cbrt := math.Cbrt
	L = 0.2104542553*cbrt(l_) + 0.7936177850*cbrt(m_) - 0.0040720468*cbrt(s_)
	A := 1.9779984951*cbrt(l_) - 2.4285922050*cbrt(m_) + 0.4505937099*cbrt(s_)
	B := 0.0259040371*cbrt(l_) + 0.7827717662*cbrt(m_) - 0.8086757660*cbrt(s_)
	C = math.Sqrt(A*A + B*B)
	H = math.Atan2(B, A) * (180 / math.Pi)
	if H < 0 {
		H += 360
	}
	return L, C, H, nil
}

func (h Hex) ToHCL() (H, C, L float64, err error) {
	rInt, gInt, bInt, err := h.ToRGB()
	if err != nil {
		return 0, 0, 0, err
	}
	R := float64(rInt) / 255
	G := float64(gInt) / 255
	B := float64(bInt) / 255
	toLinear := func(u float64) float64 {
		if u <= 0.04045 {
			return u / 12.92
		}
		return math.Pow((u+0.055)/1.055, 2.4)
	}
	R = toLinear(R)
	G = toLinear(G)
	B = toLinear(B)
	X := 0.4124564*R + 0.3575761*G + 0.1804375*B
	Y := 0.2126729*R + 0.7151522*G + 0.0721750*B
	Z := 0.0193339*R + 0.1191920*G + 0.9503041*B
	refX, refY, refZ := 0.95047, 1.00000, 1.08883
	f := func(t float64) float64 {
		if t > 0.008856 {
			return math.Cbrt(t)
		}
		return 7.787*t + 16.0/116
	}
	fX := f(X / refX)
	fY := f(Y / refY)
	fZ := f(Z / refZ)
	L = 116*fY - 16
	a := 500 * (fX - fY)
	bb := 200 * (fY - fZ)
	C = math.Sqrt(a*a + bb*bb)
	H = math.Atan2(bb, a) * (180 / math.Pi)
	if H < 0 {
		H += 360
	}
	return H, C, L, nil
}

func (h Hex) ToCMYK() (C, M, Y, K float64, err error) {
	r, g, b, err := h.ToRGB()
	if err != nil {
		return 0, 0, 0, 0, err
	}
	R := float64(r) / 255
	G := float64(g) / 255
	B := float64(b) / 255
	K = 1 - math.Max(R, math.Max(G, B))
	if K == 1 {
		C, M, Y = 0, 0, 0
	} else {
		C = (1 - R - K) / (1 - K)
		M = (1 - G - K) / (1 - K)
		Y = (1 - B - K) / (1 - K)
	}
	return C, M, Y, K, nil
}

func GenerateRandomHexColor() string {
	r := rand.Uint32N(256)
	g := rand.Uint32N(256)
	b := rand.Uint32N(256)
	return fmt.Sprintf("#%02X%02X%02X", r, g, b)
}

var hexRegex = regexp.MustCompile(`^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$`)

func IsValidHex(hex string) bool {
	hex = strings.TrimSpace(hex)
	return hexRegex.MatchString(hex)
}
