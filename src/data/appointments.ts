export interface Appointment {
  id: string;
  date: string;
  period: 'morning' | 'afternoon';
  slot: 'first' | 'second';
  ss: string;
  comments?: string;
}

export interface Availability {
  date: string;
  period: 'morning' | 'afternoon';
  slot: 'first' | 'second';
  available: boolean;
}

const APPOINTMENTS_KEY = 'appointments';
const AVAILABILITY_KEY = 'availability';

// Appointments
export const getAppointments = (date: string): Appointment[] => {
  const stored = localStorage.getItem(APPOINTMENTS_KEY);
  const all = stored ? JSON.parse(stored) : [];
  return all.filter((app: Appointment) => app.date === date);
};

export const createAppointment = (appointment: Omit<Appointment, 'id'>): Appointment => {
  const stored = localStorage.getItem(APPOINTMENTS_KEY);
  const appointments = stored ? JSON.parse(stored) : [];
  const newAppointment = {
    ...appointment,
    id: Date.now().toString()
  };
  appointments.push(newAppointment);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  return newAppointment;
};

export const deleteAppointment = (id: string): void => {
  const stored = localStorage.getItem(APPOINTMENTS_KEY);
  const appointments = stored ? JSON.parse(stored) : [];
  const filtered = appointments.filter((app: Appointment) => app.id !== id);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(filtered));
};

// Availability
export const getAvailability = (date: string): Availability[] => {
  const stored = localStorage.getItem(AVAILABILITY_KEY);
  const all = stored ? JSON.parse(stored) : [];
  return all.filter((avail: Availability) => avail.date === date);
};

export const updateAvailability = (availability: Availability): void => {
  const stored = localStorage.getItem(AVAILABILITY_KEY);
  const allAvailability = stored ? JSON.parse(stored) : [];
  
  const existingIndex = allAvailability.findIndex(
    (a: Availability) => 
      a.date === availability.date && 
      a.period === availability.period && 
      a.slot === availability.slot
  );

  if (existingIndex >= 0) {
    allAvailability[existingIndex] = availability;
  } else {
    allAvailability.push(availability);
  }

  localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(allAvailability));
};