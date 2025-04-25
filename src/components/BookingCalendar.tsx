
import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
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

interface Booking {
  date: string;
  time: string;
  name: string;
}

const BookingCalendar = () => {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  // Recuperar webhook do localStorage ou usar um valor padrão vazio
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('zapierWebhookUrl') || '';
  });
  
  // Modo de administrador para configurar o webhook
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Gerar horários disponíveis baseados na configuração
  useEffect(() => {
    const times = generateTimeSlots(DEFAULT_TIME_CONFIG);
    setAvailableTimes(times);
  }, []);

  // Atualizar horários disponíveis quando uma data for selecionada
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

  // Salvar webhook URL no localStorage
  const handleSaveWebhook = () => {
    localStorage.setItem('zapierWebhookUrl', webhookUrl);
    toast({
      title: "Configuração salva",
      description: "Webhook do Zapier foi configurado com sucesso.",
    });
    setIsAdminMode(false);
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
    
    // Formatar data e hora para exibição mais amigável
    const formattedDate = format(date, "dd/MM/yyyy");
    const bookingData = {
      name,
      date: formattedDate,
      time: selectedTime,
      email: "", // Pode adicionar mais campos no futuro
      phone: "", // Pode adicionar mais campos no futuro
      message: `Agendamento para ${formattedDate} às ${selectedTime}`,
    };

    try {
      // Verificar se o webhook foi configurado
      if (!webhookUrl) {
        toast({
          title: "Erro na configuração",
          description: "O webhook do Zapier não foi configurado. Por favor, configure antes de continuar.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Enviar dados para o Zapier
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors", // Necessário para evitar erros de CORS com o Zapier
        body: JSON.stringify(bookingData),
      });

      // Adicionar o novo agendamento à lista local
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
      
      // Reset form
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

  // Botão secreto: Pressione Alt+Z para entrar no modo admin
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
