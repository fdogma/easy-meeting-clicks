import React, { useState, useEffect } from 'react';
import { format, addHours, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription 
} from "@/components/ui/form";
import BookingSteps from "./BookingSteps";
import { DEFAULT_TIME_CONFIG, generateTimeSlots } from "../utils/timeConfig";
import { DEFAULT_WEBHOOK_URL } from './ZapierWebhookSettings';

interface Booking {
  date: string;
  time: string;
  name: string;
}

const BookingCalendar = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('zapierWebhookUrl') || DEFAULT_WEBHOOK_URL;
  });
  
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const times = generateTimeSlots(DEFAULT_TIME_CONFIG);
    setAvailableTimes(times);
  }, []);

  useEffect(() => {
    if (date) {
      const dateStr = format(date, "yyyy-MM-dd");
      const bookedTimes = bookings
        .filter((booking) => booking.date === dateStr)
        .map((booking) => booking.time);
      
      const times = generateTimeSlots(DEFAULT_TIME_CONFIG)
        .filter((time) => !bookedTimes.includes(time));
      
      setAvailableTimes(times);
    }
  }, [date, bookings]);

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    setSelectedTime(undefined);
    setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleSaveWebhook = () => {
    localStorage.setItem('zapierWebhookUrl', webhookUrl);
    toast({
      title: "Configuração salva",
      description: "Webhook do Zapier foi configurado com sucesso.",
    });
    setIsAdminMode(false);
  };

  const formatDateTimeForZapier = (date: Date, timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime.toISOString();
  };

  const handleSubmit = async () => {
    if (!date || !selectedTime || !name) {
      toast({
        title: "Erro",
        description: "Por favor preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const startDateTime = formatDateTimeForZapier(date, selectedTime);
    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();
    
    const formattedDate = format(date, "dd/MM/yyyy");
    
    const bookingData = {
      name: name,
      title: `Reunião com ${name}`,
      start_datetime: startDateTime,
      end_datetime: endDateTime,
      location: "",
      description: `Agendamento realizado pelo site para ${formattedDate} às ${selectedTime}`,
      
      summary: `Reunião com ${name}`,
      start: startDateTime,
      end: endDateTime,
      
      display_date: formattedDate,
      display_time: selectedTime,
      client_name: name,
      message: `Agendamento para ${formattedDate} às ${selectedTime}`
    };

    try {
      const webhookToUse = webhookUrl || DEFAULT_WEBHOOK_URL;
      
      console.log("Enviando dados para webhook:", webhookToUse);
      console.log("Dados do agendamento:", bookingData);
      
      const response = await fetch(webhookToUse, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify(bookingData),
      });

      const newBooking = {
        date: format(date, "yyyy-MM-dd"),
        time: selectedTime,
        name: name
      };
      
      setBookings((prevBookings) => [...prevBookings, newBooking]);

      toast({
        title: "Agendamento realizado!",
        description: "Você receberá uma confirmação em breve.",
      });
      
      setDate(undefined);
      setSelectedTime(undefined);
      setName("");
      setStep(1);
    } catch (error) {
      console.error("Erro ao enviar agendamento:", error);
      toast({
        title: "Erro no agendamento",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'z') {
        setIsAdminMode(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Card className="w-[90%] max-w-[500px] mx-auto mt-8">
      <CardHeader>
        <CardTitle>Escolha o dia e horário da sua reunião</CardTitle>
        <CardDescription>
          Siga os passos abaixo para agendar sua reunião
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAdminMode ? (
          <div className="space-y-4 border p-4 rounded-md bg-gray-50">
            <h3 className="font-bold text-lg">Configuração do Administrador</h3>
            <p className="text-sm text-muted-foreground">Configure o webhook do Zapier abaixo:</p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">URL do Webhook do Zapier</label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="Cole a URL do webhook do Zapier aqui"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Esta URL será usada para enviar informações de agendamento para o Zapier.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSaveWebhook} variant="default">
                Salvar Configurações
              </Button>
              <Button onClick={() => setIsAdminMode(false)} variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <BookingSteps currentStep={step} />

            {step >= 1 && (
              <div className="flex flex-col items-center space-y-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  disabled={(date) => date < new Date()}
                />
              </div>
            )}

            {step >= 2 && date && (
              <div className="space-y-4">
                <h3 className="font-medium">Horários Disponíveis</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableTimes.length > 0 ? (
                    availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => handleTimeSelect(time)}
                        className="w-full"
                      >
                        {time}
                      </Button>
                    ))
                  ) : (
                    <p className="text-center col-span-full text-gray-500">
                      Não há horários disponíveis nesta data. Por favor, escolha outra data.
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Seu Nome
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Digite seu nome completo"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {step === 3 && !isAdminMode && (
        <CardFooter>
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default BookingCalendar;
