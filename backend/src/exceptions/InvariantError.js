import ClientError from './ClientError.js'

class InvariantError extends ClientError {
  constructor(message = 'Invariant error') {
    super(message, 400)
    this.name = 'InvariantError'
  }
}

export default InvariantError
