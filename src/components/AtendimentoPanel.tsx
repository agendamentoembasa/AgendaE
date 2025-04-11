import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  Heading,
  VStack,
  Input,
  Textarea,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Appointment, Availability, getAppointments, createAppointment, deleteAppointment, getAvailability } from '../data/appointments';

export default function AtendimentoPanel() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<Availability[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Partial<Appointment> | null>(null);
  const [ss, setSs] = useState('');
  const [comments, setComments] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    loadAvailability();
    loadAppointments();
  }, [selectedDate]);

  const loadAvailability = () => {
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const slots = getAvailability(dateString);
      setAvailableSlots(slots.filter(slot => slot.available));
    } catch (error) {
      console.error('Error loading availability:', error);
      toast({
        title: 'Error loading availability',
        status: 'error',
        duration: 3000,
      });
    }
  };

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

  const handleSchedule = () => {
    if (!selectedSlot || !ss) return;

    try {
      const appointment = createAppointment({
        date: selectedSlot.date!,
        period: selectedSlot.period!,
        slot: selectedSlot.slot!,
        ss,
        comments
      });
      
      toast({
        title: 'Appointment scheduled successfully',
        status: 'success',
        duration: 3000,
      });
      
      onClose();
      setSs('');
      setComments('');
      setSelectedSlot(null);
      loadAppointments();
    } catch (error) {
      toast({
        title: 'Error scheduling appointment',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    try {
      deleteAppointment(appointment.id);
      toast({
        title: 'Appointment cancelled successfully',
        status: 'success',
        duration: 3000,
      });
      loadAppointments();
    } catch (error) {
      toast({
        title: 'Error cancelling appointment',
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
    const isAvailable = availableSlots.some(
      s => s.period === period && s.slot === slot
    );
    const appointment = appointments.find(
      app => app.period === period && app.slot === slot
    );

    return (
      <Box p={4} borderWidth={1} borderRadius="md">
        <VStack align="start" spacing={2}>
          <Heading size="sm">
            {period === 'morning' ? 'Manhã' : 'Tarde'} - {slot === 'first' ? '1º' : '2º'} horário
          </Heading>
          {appointment ? (
            <VStack align="start" w="100%">
              <Box>
                <p>SS: {appointment.ss}</p>
                {appointment.comments && <p>Obs: {appointment.comments}</p>}
              </Box>
              <Button
                colorScheme="red"
                size="sm"
                onClick={() => handleCancelAppointment(appointment)}
              >
                Cancelar Agendamento
              </Button>
            </VStack>
          ) : (
            <Button
              colorScheme={isAvailable ? 'green' : 'gray'}
              isDisabled={!isAvailable}
              onClick={() => {
                setSelectedSlot({
                  date: dateString,
                  period,
                  slot
                });
                onOpen();
              }}
            >
              {isAvailable ? 'Agendar' : 'Indisponível'}
            </Button>
          )}
        </VStack>
      </Box>
    );
  };

  return (
    <>
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

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Realizar Agendamento</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!ss}>
                <FormLabel>Número da SS</FormLabel>
                <Input
                  value={ss}
                  onChange={(e) => setSs(e.target.value)}
                  placeholder="Digite o número da SS"
                />
                {!ss && <FormErrorMessage>SS é obrigatória</FormErrorMessage>}
              </FormControl>
              <FormControl>
                <FormLabel>Comentários (opcional)</FormLabel>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Digite seus comentários"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSchedule} isDisabled={!ss}>
              Confirmar
            </Button>
            <Button onClick={onClose}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}