import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  Heading,
  VStack,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  Badge,
  HStack,
  Text,
  Icon,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Appointment, Availability } from '../lib/db';
import LoadingSpinner from './LoadingSpinner';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';

export default function EmbasaPanel() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadAppointments(), loadAvailability()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`/api/appointments?date=${dateString}`);
      if (!response.ok) throw new Error('Falha ao carregar agendamentos');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar agendamentos',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const loadAvailability = async () => {
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`/api/availability?date=${dateString}`);
      if (!response.ok) throw new Error('Falha ao carregar disponibilidade');
      const data = await response.json();
      const availabilityData: {[key: string]: boolean} = {};
      data.forEach((slot: Availability) => {
        const slotKey = `${slot.date}-${slot.period}-${slot.slot}`;
        availabilityData[slotKey] = slot.available;
      });
      setAvailabilityMap(availabilityData);
    } catch (error) {
      toast({
        title: 'Erro ao carregar disponibilidade',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const toggleAvailability = async (period: 'morning' | 'afternoon', slot: 'first' | 'second') => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const slotKey = `${dateString}-${period}-${slot}`;
    const isCurrentlyAvailable = availabilityMap[slotKey];

    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateString,
          period,
          slot,
          available: !isCurrentlyAvailable
        })
      });

      if (!response.ok) throw new Error('Falha ao atualizar disponibilidade');

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

    const periodLabel = period === 'morning' ? 'Manhã' : 'Tarde';
    const slotLabel = slot === 'first' ? '1º horário' : '2º horário';

    return (
      <Card bg={cardBgColor} shadow="sm">
        <CardBody>
          <VStack align="start" spacing={3}>
            <HStack justify="space-between" w="full">
              <Heading size="sm">
                {periodLabel} - {slotLabel}
              </Heading>
              <Badge 
                colorScheme={isAvailable ? 'green' : 'gray'}
                display="flex"
                alignItems="center"
              >
                <Icon as={isAvailable ? CheckIcon : CloseIcon} mr={1} />
                {isAvailable ? 'Disponível' : 'Indisponível'}
              </Badge>
            </HStack>
            
            <Button
              colorScheme={isAvailable ? 'red' : 'green'}
              variant="outline"
              size="sm"
              onClick={() => toggleAvailability(period, slot)}
              w="full"
            >
              {isAvailable ? 'Marcar como Indisponível' : 'Marcar como Disponível'}
            </Button>

            {appointment && (
              <Box 
                p={3} 
                bg={useColorModeValue('gray.50', 'gray.700')} 
                rounded="md"
                w="full"
              >
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">
                    SS: {appointment.ss}
                  </Text>
                  {appointment.comments && (
                    <Text fontSize="sm" color="gray.600">
                      Obs: {appointment.comments}
                    </Text>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Carregando horários..." />;
  }

  return (
    <Grid 
      templateColumns={{ base: '1fr', md: 'auto 1fr' }} 
      gap={8}
      alignItems="start"
    >
      <Box>
        <Card bg={cardBgColor} shadow="sm">
          <CardBody>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              locale={ptBR}
              className="rounded-calendar"
            />
          </CardBody>
        </Card>
      </Box>
      
      <Grid 
        templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
        gap={4}
      >
        {renderTimeSlot('morning', 'first')}
        {renderTimeSlot('morning', 'second')}
        {renderTimeSlot('afternoon', 'first')}
        {renderTimeSlot('afternoon', 'second')}
      </Grid>
    </Grid>
  );
}