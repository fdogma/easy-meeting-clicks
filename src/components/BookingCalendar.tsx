
import React, { useState } from 'react';
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

const AVAILABLE_TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
];

const BookingCalendar = () => {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
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
    
    // Aqui você vai adicionar sua URL do Zapier para receber as notificações
    const webhookUrl = "SEU_WEBHOOK_ZAPIER";

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          name,
          date: format(date, "dd/MM/yyyy"),
          time: selectedTime,
        }),
      });

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
      toast({
        title: "Erro no agendamento",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-[90%] max-w-[500px] mx-auto mt-8">
      <CardHeader>
        <CardTitle>Escolha o dia e horário da sua reunião</CardTitle>
        <CardDescription>
          Selecione a data e horário que melhor se adequa à sua disponibilidade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
              {AVAILABLE_TIMES.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => handleTimeSelect(time)}
                  className="w-full"
                >
                  {time}
                </Button>
              ))}
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
                placeholder="Digite seu nome"
              />
            </div>
          </div>
        )}
      </CardContent>
      
      {step === 3 && (
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
