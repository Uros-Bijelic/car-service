import {
    integer,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar
} from 'drizzle-orm/pg-core';

export const appointmentStatusEnum = pgEnum('appointment_status', [
    'pending',
    'in_progress',
    'completed',
    'cancelled'
]);

export const usersTable = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 50 }).notNull(),
    firstName: varchar('first_name', { length: 50 }),
    lastName: varchar('last_name', { length: 50 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const carsTable = pgTable('cars', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .references(() => usersTable.id, {
            onDelete: 'cascade'
        })
        .notNull(),
    make: varchar('make', { length: 255 }).notNull(),
    model: varchar('model', { length: 255 }).notNull(),
    year: integer().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const appointmentsTable = pgTable('appointments', {
    id: uuid('id').primaryKey().defaultRandom(),
    carId: uuid('car_id')
        .references(() => carsTable.id, {
            onDelete: 'cascade'
        })
        .notNull(),
    description: text('description').notNull(),
    scheduledAt: timestamp('scheduled_at').notNull(),
    status: appointmentStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const servicesTable = pgTable('services', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    price: numeric('price').notNull(),
    durationTimeMinutes: integer('duration_time_minutes').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const appointmentsServicesTable = pgTable('appointment_services', {
    id: uuid('id').primaryKey().defaultRandom(),
    appointmentId: uuid('appointment_id')
        .references(() => appointmentsTable.id, { onDelete: 'cascade' })
        .notNull(),
    serviceId: uuid('service_id')
        .references(() => servicesTable.id, {
            onDelete: 'restrict'
        })
        .notNull(),
    priceAtTime: numeric('price_at_time').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});
