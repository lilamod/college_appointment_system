const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hash, role });
  res.json(user);
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.sendStatus(401);
  const token = jwt.sign({ id: user._id, role: user.role }, "process.env.JWT_SECRET");
  res.json({ token });
});

router.post('/availability', auth(['professor']), async (req, res) => {
  const { time } = req.body;
  const availability = await Availability.create({ professor: req.user.id, time });
  res.json(availability);
});

router.get('/availability/:professorId', auth(['student']), async (req, res) => {
  const { professorId } = req.params;
  const booked = await Appointment.find({ professor: professorId }).select('time');
  const bookedTimes = booked.map(b => b.time);
  const slots = await Availability.find({
    professor: professorId,
    time: { $nin: bookedTimes }
  });
  res.json(slots);
});

router.post('/appointments', auth(['student']), async (req, res) => {
  const { professorId, time } = req.body;
  const availability = await Availability.findOne({professor: professorId, time: {$in: time}})
  if(availability){
    const existing = await Appointment.findOne({ professor: professorId, time });
    if (existing) return res.status(409).send("Time slot already booked.");
    const appointment = await Appointment.create({
      student: req.user.id,
      professor: professorId,
      time
    });
    res.json(appointment);
  }else{
    res.json("Professor is not available")
  }
});

router.delete('/appointments/:id', auth(['professor']), async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment || appointment.professor.toString() !== req.user.id) return res.sendStatus(403);
  await appointment.deleteOne();
  res.sendStatus(204);
});

router.get('/appointments', auth(['student']), async (req, res) => {
  const appointments = await Appointment.find({ student: req.user.id });
  res.json(appointments);
});

module.exports = router;
