
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
  
  // Função auxiliar para gerar horários em intervalos de 30 minutos
  const generateHalfHourlySlots = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    for (let time = startTime; time < endTime; time += 30) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      slots.push(
        `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      );
    }
  };

  generateHalfHourlySlots(config.startMorning, config.endMorning);
  generateHalfHourlySlots(config.startAfternoon, config.endAfternoon);
  
  return slots;
};

