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
import { Availability, Appointment } from '../lib/db';
import LoadingSpinner from './LoadingSpinner';
import { CheckIcon, CloseIcon, CalendarIcon } from '@chakra-ui/icons';

export default function AtendimentoPanel() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<Availability[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Partial<Appointment> | null>(null);
  const [ss, setSs] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadAvailability(), loadAppointments()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`/api/availability?date=${dateString}`);
      if (!response.ok) throw new Error('Falha ao carregar disponibilidade');
      const data = await response.json();
      setAvailableSlots(data.filter((slot: Availability) => slot.available));
    } catch (error) {
      toast({
        title: 'Erro ao carregar disponibilidade',
        status: 'error',
        duration: 3000,
      });
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

  const handleSchedule = async () => {
    if (!selectedSlot || !ss) return;

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedSlot.date,
          period: selectedSlot.period,
          slot: selectedSlot.slot,
          ss,
          comments
        })
      });

      if (!response.ok) throw new Error('Falha ao agendar horário');
      
      toast({
        title: 'Agendamento realizado com sucesso',
        status: 'success',
        duration: 3000,
      });
      
      onClose();
      setSs('');
      setComments('');
      setSelectedSlot(null);
      await loadData();
    } catch (error) {
      toast({
        title: 'Erro ao realizar agendamento',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      const response = await fetch(`/api/appointments?id=${appointment.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Falha ao cancelar agendamento');

      toast({
        title: 'Agendamento cancelado com sucesso',
        status: 'success',
        duration: 3000,
      });
      await loadData();
    } catch (error) {
      toast({
        title: 'Erro ao cancelar agendamento',
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
                colorScheme={isAvailable ? 'green' : appointment ? 'blue' : 'gray'}
                display="flex"
                alignItems="center"
              >
                <Icon 
                  as={isAvailable ? CheckIcon : appointment ? CalendarIcon : CloseIcon} 
                  mr={1} 
                />
                {isAvailable ? 'Disponível' : appointment ? 'Agendado' : 'Indisponível'}
              </Badge>
            </HStack>

            {appointment ? (
              <VStack align="start" spacing={2} w="full">
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
                <Button
                  colorScheme="red"
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancelAppointment(appointment)}
                  w="full"
                >
                  Cancelar Agendamento
                </Button>
              </VStack>
            ) : (
              <Button
                colorScheme={isAvailable ? 'blue' : 'gray'}
                size="sm"
                isDisabled={!isAvailable}
                onClick={() => {
                  setSelectedSlot({
                    date: dateString,
                    period,
                    slot
                  });
                  onOpen();
                }}
                w="full"
              >
                {isAvailable ? 'Agendar Horário' : 'Indisponível'}
              </Button>
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
    <>
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
                {!ss && (
                  <FormErrorMessage>SS é obrigatória</FormErrorMessage>
                )}
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