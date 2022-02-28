import fetch from 'auth/FetchInterceptor'
import { API_BASE_URL } from 'configs/AppConfig'

const JwtAuthService = {}

JwtAuthService.login = function (data) {
	return fetch({
		url: API_BASE_URL + '/user/login',
		method: 'post',
		headers: {
      'public-request': 'true'
    },
		data: data
	})
}

JwtAuthService.signUp = function (data) {
	return fetch({
		url: API_BASE_URL + '/user/signup',
		method: 'post',
		headers: {
      'public-request': 'true'
    },
		data: data
	})
}

export default JwtAuthService