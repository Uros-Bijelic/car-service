import { User } from '@db/schema.ts';
import type { AuthPayload } from '@utils/jwt.ts';

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
