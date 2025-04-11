import type { NextApiRequest, NextApiResponse } from 'next';
import { getAvailability, setAvailability } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const { date } = req.query;
        if (!date || typeof date !== 'string') {
          return res.status(400).json({ error: 'Date is required' });
        }
        const availability = await getAvailability(date);
        res.status(200).json(availability);
      } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'POST':
      try {
        const { date, period, slot, available } = req.body;
        if (!date || !period || !slot || typeof available !== 'boolean') {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        await setAvailability(date, period, slot, available);
        res.status(200).json({ message: 'Availability updated successfully' });
      } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}