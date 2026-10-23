package internal

import (
	"fmt"
	"math"
)

type HSL struct {
	H float64
	S float64
	L float64
}

func HSLToHex(hsl HSL) string {
	h := hsl.H
	s := hsl.S
	l := hsl.L
	c := (1 - math.Abs(2*l-1)) * s
	x := c * (1 - math.Abs(math.Mod(h/60, 2)-1))
	m := l - c/2
	var r, g, b float64
	switch {
	case h < 60:
		r, g, b = c, x, 0
	case h < 120:
		r, g, b = x, c, 0
	case h < 180:
		r, g, b = 0, c, x
	case h < 240:
		r, g, b = 0, x, c
	case h < 300:
		r, g, b = x, 0, c
	default:
		r, g, b = c, 0, x
	}
	r = (r + m) * 255
	g = (g + m) * 255
	b = (b + m) * 255
	return fmt.Sprintf("#%02x%02x%02x", clampInt(r), clampInt(g), clampInt(b))
}

func clampInt(v float64) int {
	if v < 0 {
		return 0
	}
	if v > 255 {
		return 255
	}
	return int(math.Round(v))
}

func HSLToRGB(h float64, s float64, l float64) (int, int, int) {
	h = math.Mod(h, 360)
	if h < 0 {
		h += 360
	}
	s /= 100
	l /= 100
	c := (1 - math.Abs(2*l-1)) * s
	x := c * (1 - math.Abs(math.Mod(h/60, 2)-1))
	m := l - c/2
	var r, g, b float64
	switch {
	case h < 60:
		r, g, b = c, x, 0
	case h < 120:
		r, g, b = x, c, 0
	case h < 180:
		r, g, b = 0, c, x
	case h < 240:
		r, g, b = 0, x, c
	case h < 300:
		r, g, b = x, 0, c
	default:
		r, g, b = c, 0, x
	}
	R := int(math.Round((r + m) * 255))
	G := int(math.Round((g + m) * 255))
	B := int(math.Round((b + m) * 255))
	return R, G, B
}

func HSLToOKLCH(h, s, l float64) (L_ok, C_ok, H_ok float64) {
	r, g, b := HSLToRGB(h, s, l)
	toLinear := func(c float64) float64 {
		c = c / 255
		if c <= 0.04045 {
			return c / 12.92
		}
		return math.Pow((c+0.055)/1.055, 2.4)
	}
	R := toLinear(float64(r))
	G := toLinear(float64(g))
	B := toLinear(float64(b))
	l_ := 0.4122214708*R + 0.5363325363*G + 0.0514459929*B
	m_ := 0.2119034982*R + 0.6806995451*G + 0.1073969566*B
	s_ := 0.0883024619*R + 0.2817188376*G + 0.6299787005*B
	cbrt := func(x float64) float64 { return math.Cbrt(x) }
	L := 0.2104542553*cbrt(l_) + 0.7936177850*cbrt(m_) - 0.0040720468*cbrt(s_)
	A := 1.9779984951*cbrt(l_) - 2.4285922050*cbrt(m_) + 0.4505937099*cbrt(s_)
	Bb := 0.0259040371*cbrt(l_) + 0.7827717662*cbrt(m_) - 0.8086757660*cbrt(s_)
	C := math.Sqrt(A*A + Bb*Bb)
	Hh := math.Atan2(Bb, A) * (180 / math.Pi)
	if Hh < 0 {
		Hh += 360
	}
	return L, C, Hh
}
