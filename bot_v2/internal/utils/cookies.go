package utils

import (
	"net/http"
	"time"
)

func SetStateCookie(w http.ResponseWriter, state string, secure bool, sameSite http.SameSite, cookieName string, maxAge int) {
	cookie := &http.Cookie{
		Name:     cookieName,
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		MaxAge:   maxAge,
	}
	http.SetCookie(w, cookie)
}

func ClearStateCookie(w http.ResponseWriter, secure bool, sameSite http.SameSite, cookieName string) {
	cookie := &http.Cookie{
		Name:     cookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		MaxAge:   -1,
	}
	http.SetCookie(w, cookie)
}

func ValidateStateCookie(r *http.Request, state string, cookieName string) bool {
	cookie, err := r.Cookie(cookieName)
	if err != nil {
		return false
	}
	return cookie.Value == state
}

func SetAuthCookie(w http.ResponseWriter, token string, secure bool, sameSite http.SameSite, cookieName string) {
	cookie := &http.Cookie{
		Name:     cookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		MaxAge:   int((7 * 24 * time.Hour).Seconds()),
	}
	http.SetCookie(w, cookie)
}

func ClearAuthCookie(w http.ResponseWriter, secure bool, sameSite http.SameSite, cookieName string) {
	cookie := &http.Cookie{
		Name:     cookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
		MaxAge:   -1,
	}
	http.SetCookie(w, cookie)
}

func CookieSameSite(secure bool) http.SameSite {
	if secure {
		return http.SameSiteNoneMode
	}
	return http.SameSiteLaxMode
}