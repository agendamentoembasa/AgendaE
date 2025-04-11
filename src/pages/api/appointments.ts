import type { NextApiRequest, NextApiResponse } from 'next';
import { getAppointments, createAppointment, deleteAppointment } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const { date } = req.query;
        if (!date || typeof date !== 'string') {
          return res.status(400).json({ error: 'Date is required' });
        }
        const appointments = await getAppointments(date);
        res.status(200).json(appointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'POST':
      try {
        const { date, period, slot, ss, comments } = req.body;
        if (!date || !period || !slot || !ss) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        const appointment = await createAppointment(date, period, slot, ss, comments);
        res.status(201).json(appointment);
      } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'Appointment ID is required' });
        }
        await deleteAppointment(parseInt(id, 10));
        res.status(200).json({ message: 'Appointment deleted successfully' });
      } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}