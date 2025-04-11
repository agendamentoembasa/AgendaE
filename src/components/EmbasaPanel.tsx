import { useState, useEffect } from 'react';
import { Box, Button, Grid, Heading, VStack, useToast } from '@chakra-ui/react';
import { format } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  Appointment, 
  Availability, 
  getAppointments, 
  getAvailability, 
  updateAvailability 
} from '../data/appointments';

export default function EmbasaPanel() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<{[key: string]: boolean}>({});
  const toast = useToast();

  useEffect(() => {
    loadAppointments();
    loadAvailability();
  }, [selectedDate]);

  const loadAppointments = () => {
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const apps = getAppointments(dateString);
      setAppointments(apps);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast({
        title: 'Error loading appointments',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const loadAvailability = () => {
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const slots = getAvailability(dateString);
      const availabilityData: {[key: string]: boolean} = {};
      slots.forEach((slot) => {
        const slotKey = `${slot.date}-${slot.period}-${slot.slot}`;
        availabilityData[slotKey] = slot.available;
      });
      setAvailabilityMap(availabilityData);
    } catch (error) {
      console.error('Error loading availability:', error);
      toast({
        title: 'Error loading availability',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const toggleAvailability = (period: 'morning' | 'afternoon', slot: 'first' | 'second') => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const slotKey = `${dateString}-${period}-${slot}`;
    const isCurrentlyAvailable = availabilityMap[slotKey];

    try {
      const availability: Availability = {
        date: dateString,
        period,
        slot,
        available: !isCurrentlyAvailable
      };
      updateAvailability(availability);

      setAvailabilityMap(prev => ({
        ...prev,
        [slotKey]: !isCurrentlyAvailable
      }));

      toast({
        title: 'Availability updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error updating availability',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDateChange = (value: Date | Date[]) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const renderTimeSlot = (period: 'morning' | 'afternoon', slot: 'first' | 'second') => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const slotKey = `${dateString}-${period}-${slot}`;
    const appointment = appointments.find(
      app => app.period === period && app.slot === slot
    );
    const isAvailable = availabilityMap[slotKey];

    return (
      <Box p={4} borderWidth={1} borderRadius="md">
        <VStack align="start" spacing={2}>
          <Heading size="sm">
            {period === 'morning' ? 'Manhã' : 'Tarde'} - {slot === 'first' ? '1º' : '2º'} horário
          </Heading>
          <Button
            colorScheme={isAvailable ? 'green' : 'gray'}
            onClick={() => toggleAvailability(period, slot)}
          >
            {isAvailable ? 'Disponível' : 'Indisponível'}
          </Button>
          {appointment && (
            <Box>
              <p>SS: {appointment.ss}</p>
              {appointment.comments && <p>Obs: {appointment.comments}</p>}
            </Box>
          )}
        </VStack>
      </Box>
    );
  };

  return (
    <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={8}>
      <Box>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          locale="pt-BR"
        />
      </Box>
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        {renderTimeSlot('morning', 'first')}
        {renderTimeSlot('morning', 'second')}
        {renderTimeSlot('afternoon', 'first')}
        {renderTimeSlot('afternoon', 'second')}
      </Grid>
    </Grid>
  );
}