package internal

import (
	"errors"
	"fmt"
	"math"
)

type RGB struct {
	R int
	G int
	B int
}

func (c RGB) IsValid() bool {
	return c.R >= 0 && c.R <= 255 &&
		c.G >= 0 && c.G <= 255 &&
		c.B >= 0 && c.B <= 255
}

func (c RGB) ToHex() (string, error) {
	if !c.IsValid() {
		return "", errors.New("invalid RGB value")
	}
	return fmt.Sprintf("#%02X%02X%02X", c.R, c.G, c.B), nil
}

func (c RGB) ToHSL() (h, s, l float64, err error) {
	if !c.IsValid() {
		return 0, 0, 0, errors.New("invalid RGB value")
	}
	r := float64(c.R) / 255
	g := float64(c.G) / 255
	b := float64(c.B) / 255
	max := math.Max(r, math.Max(g, b))
	min := math.Min(r, math.Min(g, b))
	l = (max + min) / 2
	if max == min {
		h, s = 0, 0
	} else {
		d := max - min
		if l > 0.5 {
			s = d / (2 - max - min)
		} else {
			s = d / (max + min)
		}
		switch max {
		case r:
			h = (g - b) / d
			if g < b {
				h += 6
			}
		case g:
			h = (b-r)/d + 2
		case b:
			h = (r-g)/d + 4
		}
		h *= 60
	}
	return h, s * 100, l * 100, nil
}

func (c RGB) ToCMYK() (float64, float64, float64, float64, error) {
	if !c.IsValid() {
		return 0, 0, 0, 0, errors.New("invalid RGB value")
	}
	r := float64(c.R) / 255
	g := float64(c.G) / 255
	b := float64(c.B) / 255
	k := 1 - math.Max(r, math.Max(g, b))
	if k == 1 {
		return 0, 0, 0, 1, nil
	}
	cy := (1 - r - k) / (1 - k)
	m := (1 - g - k) / (1 - k)
	y := (1 - b - k) / (1 - k)
	return cy * 100, m * 100, y * 100, k * 100, nil
}

func (c RGB) ToHCL() (h, cVal, l float64, err error) {
	if !c.IsValid() {
		return 0, 0, 0, errors.New("invalid RGB value")
	}
	R := linearize(float64(c.R) / 255)
	G := linearize(float64(c.G) / 255)
	B := linearize(float64(c.B) / 255)
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
	fX, fY, fZ := f(X/refX), f(Y/refY), f(Z/refZ)
	L := 116*fY - 16
	a := 500 * (fX - fY)
	bb := 200 * (fY - fZ)
	cVal = math.Sqrt(a*a + bb*bb)
	h = math.Atan2(bb, a) * (180 / math.Pi)
	if h < 0 {
		h += 360
	}
	l = L
	return h, cVal, l, nil
}

func (c RGB) ToOKLCH() (L, C, H float64, err error) {
	if !c.IsValid() {
		return 0, 0, 0, errors.New("invalid RGB value")
	}
	toLinear := func(v float64) float64 {
		v = v / 255
		if v <= 0.04045 {
			return v / 12.92
		}
		return math.Pow((v+0.055)/1.055, 2.4)
	}
	R := toLinear(float64(c.R))
	G := toLinear(float64(c.G))
	B := toLinear(float64(c.B))
	l_ := 0.4122214708*R + 0.5363325363*G + 0.0514459929*B
	m_ := 0.2119034982*R + 0.6806995451*G + 0.1073969566*B
	s_ := 0.0883024619*R + 0.2817188376*G + 0.6299787005*B
	cbrt := math.Cbrt
	L_ := 0.2104542553*cbrt(l_) + 0.7936177850*cbrt(m_) - 0.0040720468*cbrt(s_)
	A := 1.9779984951*cbrt(l_) - 2.4285922050*cbrt(m_) + 0.4505937099*cbrt(s_)
	Bb := 0.0259040371*cbrt(l_) + 0.7827717662*cbrt(m_) - 0.8086757660*cbrt(s_)
	C = math.Sqrt(A*A + Bb*Bb)
	H = math.Atan2(Bb, A) * (180 / math.Pi)
	if H < 0 {
		H += 360
	}
	L = L_
	return L, C, H, nil
}

func linearize(u float64) float64 {
	if u <= 0.04045 {
		return u / 12.92
	}
	return math.Pow((u+0.055)/1.055, 2.4)
}
