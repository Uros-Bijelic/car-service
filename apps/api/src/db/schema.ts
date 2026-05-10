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
import { relations } from 'drizzle-orm';

export const appointmentStatusEnum = pgEnum('appointment_status', [
    'pending',
    'in_progress',
    'completed',
    'cancelled'
]);

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    firstName: varchar('first_name', { length: 50 }),
    lastName: varchar('last_name', { length: 50 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 255 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const cars = pgTable('cars', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .references(() => users.id, {
            onDelete: 'cascade'
        })
        .notNull(),
    make: varchar('make', { length: 255 }).notNull(),
    model: varchar('model', { length: 255 }).notNull(),
    year: integer().notNull(),
    vin: varchar('vin', { length: 50 }).unique(),
    licensePlate: varchar('license_plate', { length: 20 }).unique().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const appointments = pgTable('appointments', {
    id: uuid('id').primaryKey().defaultRandom(),
    carId: uuid('car_id')
        .references(() => cars.id, {
            onDelete: 'cascade'
        })
        .notNull(),
    description: text('description').notNull(),
    scheduledAt: timestamp('scheduled_at').notNull(),
    status: appointmentStatusEnum('status').default('pending').notNull(),
    estimatedDurationMinutes: integer('estimated_duration_minutes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const services = pgTable('services', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    price: numeric('price').notNull(),
    durationTimeMinutes: integer('duration_time_minutes').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const appointmentServices = pgTable('appointment_services', {
    id: uuid('id').primaryKey().defaultRandom(),
    appointmentId: uuid('appointment_id')
        .references(() => appointments.id, { onDelete: 'cascade' })
        .notNull(),
    serviceId: uuid('service_id')
        .references(() => services.id, {
            onDelete: 'restrict'
        })
        .notNull(),
    priceAtTime: numeric('price_at_time').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
});

export const userRelations = relations(users, ({ many }) => ({
    cars: many(cars)
}));

export const carsRelations = relations(cars, ({ one, many }) => ({
    user: one(users, {
        fields: [cars.userId],
        references: [users.id]
    }),
    appointments: many(appointments)
}));

export const appointmentsRelations = relations(
    appointments,
    ({ one, many }) => ({
        car: one(cars, {
            fields: [appointments.carId],
            references: [cars.id]
        }),
        appointmentServices: many(appointmentServices)
    })
);

export const servicesRelations = relations(services, ({ many }) => ({
    appointmentServices: many(appointmentServices)
}));

export const appointmentServiceRelations = relations(
    appointmentServices,
    ({ one }) => ({
        appointment: one(appointments, {
            fields: [appointmentServices.appointmentId],
            references: [appointments.id]
        }),
        service: one(services, {
            fields: [appointmentServices.serviceId],
            references: [services.id]
        })
    })
);
