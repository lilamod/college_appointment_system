const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability'); // if this model exists

let tokenStudent1, tokenStudent2, tokenProf, profId, appointmentId;

beforeAll(async () => {
  await mongoose.connect("mongodb://localhost:27017/college_system");

  await User.deleteMany({});
  await Appointment.deleteMany({});
  await Availability.deleteMany?.({}); // optional if you have this model

  await request(app).post('/api/register').send({ username: 's1', password: 'pass', role: 'student' });
  await request(app).post('/api/register').send({ username: 's2', password: 'pass', role: 'student' });
  
  const profRes = await request(app).post('/api/register').send({ username: 'p1', password: 'pass', role: 'professor' });
  profId = profRes.body._id;

  const loginS1 = await request(app).post('/api/login').send({ username: 's1', password: 'pass' });
  tokenStudent1 = loginS1.body.token;

  const loginS2 = await request(app).post('/api/login').send({ username: 's2', password: 'pass' });
  tokenStudent2 = loginS2.body.token;

  const loginP1 = await request(app).post('/api/login').send({ username: 'p1', password: 'pass' });
  tokenProf = loginP1.body.token;
});

it('Full user flow', async () => {
  const avail1 = await request(app)
    .post('/api/availability')
    .set('token', tokenProf)
    .send({ time: '10AM' });
  expect(avail1.statusCode).toBe(200);

  const avail2 = await request(app)
    .post('/api/availability')
    .set('token', tokenProf)
    .send({ time: '11AM' });
  expect(avail2.statusCode).toBe(200);

  const availRes = await request(app)
    .get(`/api/availability/${profId}`)
    .set('token', tokenStudent1)
  expect(availRes.statusCode).toBe(200);

  const availabilityArray = Array.isArray(availRes.body)
    ? availRes.body
    : availRes.body.availabilities || [];

  expect(availabilityArray.length).toBeGreaterThanOrEqual(2);

  const bookRes = await request(app)
    .post('/api/appointments')
    .set('token', tokenStudent1)
    .send({ professorId: profId, time: '10AM' });
  expect(bookRes.statusCode).toBe(200);
  appointmentId = bookRes.body._id;

  const bookRes2 = await request(app)
    .post('/api/appointments')
    .set('token', tokenStudent2)
    .send({ professorId: profId, time: '11AM' });
  expect(bookRes2.statusCode).toBe(200);

  const deleteRes = await request(app)
    .delete(`/api/appointments/${appointmentId}`)
    .set('token', tokenProf);;
  expect(deleteRes.statusCode).toBe(204);

  const appt = await request(app)
    .get('/api/appointments')
    .set('token', tokenStudent1)
  expect(appt.body).toEqual([]);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});
