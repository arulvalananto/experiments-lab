import jwt from 'jsonwebtoken'
import { config } from './config'
import { TokenPayload } from '../types'

export function generateToken(payload: TokenPayload): string {
    const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn']
    })

    return token
}
