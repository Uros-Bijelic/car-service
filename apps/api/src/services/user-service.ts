import { db } from '@/db/db.js';
import type { UserRepository } from '@/repositories/user-repository.js';

export class UserService {
    constructor(private userRepo: UserRepository) {}
}
