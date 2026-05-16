import ClientError from './ClientError.js'

class AuthorizationError extends ClientError {
  constructor(message = 'Authorization failed') {
    super(message, 403)
    this.name = 'AuthorizationError'
  }
}

export default AuthorizationError
