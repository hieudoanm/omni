package svg

import (
	"strings"
	"testing"

	"github.com/notnil/chess"
)

func TestRenderBoardSVG(t *testing.T) {
	game := chess.NewGame()
	board := game.Position().Board()
	svg := renderBoardSVG(board)

	if !strings.HasPrefix(svg, `<svg xmlns="http://www.w3.org/2000/svg"`) {
		t.Errorf("SVG should start with svg tag, got: %s", svg[:50])
	}

	if !strings.HasSuffix(svg, `</svg>`) {
		t.Errorf("SVG should end with </svg>")
	}

	if !strings.Contains(svg, `width="480"`) {
		t.Errorf("SVG should have width=\"480\" (8 × 60)")
	}

	if !strings.Contains(svg, `height="480"`) {
		t.Errorf("SVG should have height=\"480\" (8 × 60)")
	}

	rectCount := strings.Count(svg, "<rect ")
	if rectCount != 64 {
		t.Errorf("expected 64 <rect> elements for 64 squares, got %d", rectCount)
	}

	if !strings.Contains(svg, `fill="#b58863"`) {
		t.Errorf("expected dark square color #b58863")
	}

	if !strings.Contains(svg, `fill="#f0d9b5"`) {
		t.Errorf("expected light square color #f0d9b5")
	}
}
