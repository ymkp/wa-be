package auth

import (
	"encoding/json"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"

	typeAuth "wa-worker/internal/auth/types"

	"wa-worker/pkg/auth"
	"wa-worker/pkg/router"
)

// Auth
// @Summary     Generate Authentication Token
// @Description Get Authentication Token
// @Tags        Root
// @Produce     json
// @Success     200
// @Security    BasicAuth
// @Router      /api/v1/whatsapp/auth [get]
func Auth(c echo.Context) error {
	var reqAuthBasicInfo typeAuth.RequestAuthBasicInfo
	var resAuthJWTData typeAuth.ResponseAuthJWTData

	// Parse Basic Auth Information from Rewrited Body Request
	// By Basic Auth Middleware
	_ = json.NewDecoder(c.Request().Body).Decode(&reqAuthBasicInfo)

	// Create JWT Claims
	var jwtClaims typeAuth.AuthJWTClaims
	if auth.AuthJWTExpiredHour > 0 {
		jwtClaims = typeAuth.AuthJWTClaims{
			Data: typeAuth.AuthJWTClaimsPayload{
				JID: reqAuthBasicInfo.Username,
			},
			StandardClaims: jwt.StandardClaims{
				IssuedAt:  time.Now().Unix(),
				ExpiresAt: time.Now().Add(time.Hour * time.Duration(auth.AuthJWTExpiredHour)).Unix(),
			},
		}
	} else {
		jwtClaims = typeAuth.AuthJWTClaims{
			Data: typeAuth.AuthJWTClaimsPayload{
				JID: reqAuthBasicInfo.Username,
			},
			StandardClaims: jwt.StandardClaims{
				IssuedAt: time.Now().Unix(),
			},
		}
	}

	// Create JWT Token
	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwtClaims)

	// Generate Encoded JWT Token
	jwtTokenEncoded, err := jwtToken.SignedString([]byte(auth.AuthJWTSecret))
	if err != nil {
		return router.ResponseInternalError(c, "")
	}

	// Set Encoded JWT Token as Response Data
	resAuthJWTData.Token = jwtTokenEncoded

	// Return JWT Token in JSON Response
	return router.ResponseSuccessWithData(c, "Successfully Authenticated", resAuthJWTData)
}
