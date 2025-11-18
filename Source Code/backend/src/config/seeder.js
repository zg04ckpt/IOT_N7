import db from './database.js';
import Role from '../models/role.model.js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'
import userRepo from '../repositories/user.repo.js';
import { hashPassword } from '../utils/pass.util.js';

dotenv.config()

async function seed() {
    console.log(`Start seeding database ...`);
	try {
		const users = [
			{ email: process.env.IOT_ADMIN_EMAIL, role: Role.ADMIN, password: process.env.IOT_ADMIN_PASS },
			{ email: process.env.GUARD_EMAIL, role: Role.GUARD, password: process.env.GUARD_PASS }
		];

		for (const u of users) {
            if (await userRepo.emailExists(u.email)) {
                console.log(`User with role = ${u.role} has been created, skip`);
                continue;
            }
            u.password = await hashPassword(u.password);
            const user = await userRepo.create(u);
			console.log(`Inserted ${user.role} (id=${user.id})`);
		}

		console.log('Seeding completed');
		process.exit(0);
	} catch (err) {
		console.error('Seeder failed:', err);
		process.exit(1);
	}
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
	seed();
}

export default seed;

