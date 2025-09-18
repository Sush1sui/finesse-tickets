package server

import "net/http"

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", IndexHandler)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
			case "/":
				mux.ServeHTTP(w, r)
			default:
				http.NotFound(w, r)
		}
	})
}