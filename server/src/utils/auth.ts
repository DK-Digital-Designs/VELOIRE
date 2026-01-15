import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'veloire_secret';
const BCRYPT_SALT_ROUNDS = 10;

export interface TokenPayload {
    userId: string;
    role: string;
}

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
};

export const verifyToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
};
