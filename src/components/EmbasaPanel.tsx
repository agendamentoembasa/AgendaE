import { useState, useEffect } from 'react';
import { Box, Button, Grid, Heading, VStack, useToast } from '@chakra-ui/react';
import { db } from '../config/firebase';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface Appointment {
  id: string;
  date: string;
  period: 'morning' | 'afternoon';
  slot: 'first' | 'second';
  ss?: string;
  comments?: string;
}

export default function EmbasaPanel() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<{[key: string]: boolean}>({});
  const toast = useToast();

  useEffect(() => {
    loadAppointments();
    loadAvailability();
  }, [selectedDate]);

  const loadAppointments = async () => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const q = query(
      collection(db, 'appointments'),
      where('date', '==', dateString)
    );
    
    const querySnapshot = await getDocs(q);
    const apps: Appointment[] = [];
    querySnapshot.forEach((doc) => {
      apps.push({ id: doc.id, ...doc.data() } as Appointment);
    });
    setAppointments(apps);
  };

  const loadAvailability = async () => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const q = query(
      collection(db, 'availability'),
      where('date', '==', dateString)
    );
    
    const querySnapshot = await getDocs(q);
    const availabilityData: {[key: string]: boolean} = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const slotKey = `${data.date}-${data.period}-${data.slot}`;
      availabilityData[slotKey] = data.available;
    });
    setAvailabilityMap(availabilityData);
  };

  const toggleAvailability = async (period: 'morning' | 'afternoon', slot: 'first' | 'second') => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const slotKey = `${dateString}-${period}-${slot}`;
    const isCurrentlyAvailable = availabilityMap[slotKey];

    try {
      await setDoc(doc(db, 'availability', slotKey), {
        date: dateString,
        period,
        slot,
        available: !isCurrentlyAvailable
      });

      setAvailabilityMap(prev => ({
        ...prev,
        [slotKey]: !isCurrentlyAvailable
      }));

      toast({
        title: 'Disponibilidade atualizada',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar disponibilidade',
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