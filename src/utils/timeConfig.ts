
export interface TimeConfig {
  startMorning: string;
  endMorning: string;
  startAfternoon: string;
  endAfternoon: string;
}

export const DEFAULT_TIME_CONFIG: TimeConfig = {
  startMorning: "08:00",
  endMorning: "12:00",
  startAfternoon: "13:30",
  endAfternoon: "18:00",
};

export const generateTimeSlots = (config: TimeConfig) => {
  const slots: string[] = [];
  
  // Função auxiliar para gerar horários em intervalos de 1 hora
  const generateHourlySlots = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    
    for (let hour = startHour; hour <= endHour; hour++) {
      if (hour === endHour && endMinute === 0) continue;
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
  };

  generateHourlySlots(config.startMorning, config.endMorning);
  generateHourlySlots(config.startAfternoon, config.endAfternoon);
  
  return slots;
};
