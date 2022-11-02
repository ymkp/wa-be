package index

import (
	"github.com/labstack/echo/v4"

	"wa-worker/pkg/router"
)

// Index
// @Summary     Show The Status of The Server
// @Description Get The Server Status
// @Tags        Root
// @Produce     json
// @Success     200
// @Router      /api/v1/whatsapp [get]
func Index(c echo.Context) error {
	return router.ResponseSuccess(c, "Situspol WA Mimin - Dev is running")
}
