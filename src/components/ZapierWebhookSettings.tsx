
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

/** URL fixa do Webhook Zapier fornecida pelo cliente */
export const DEFAULT_WEBHOOK_URL =
  "https://hooks.zapier.com/hooks/catch/22657275/2p3n7tf/";

// Validação – exige URL válida do domínio Zapier
const formSchema = z.object({
  webhookUrl: z
    .string()
    .url({ message: "Informe uma URL válida (https://…)" })
    .regex(
      /^https:\/\/hooks\.zapier\.com\/hooks\/catch\/[A-Za-z0-9/_-]+\/?$/,
      "A URL precisa ser um Webhook Zapier",
    ),
});

type ZapierWebhookSettingsProps = {
  onSave: (url: string) => void;
  initialValue?: string;
};

export const ZapierWebhookSettings = ({
  onSave,
  initialValue = DEFAULT_WEBHOOK_URL,
}: ZapierWebhookSettingsProps) => {
  const { toast } = useToast();
  const [testLoading, setTestLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { webhookUrl: initialValue },
  });

  useEffect(() => {
    if (initialValue) {
      form.reset({ webhookUrl: initialValue });
    }
  }, [initialValue, form]);

  const onSubmit = ({ webhookUrl }: z.infer<typeof formSchema>) => {
    localStorage.setItem('zapierWebhookUrl', webhookUrl);
    onSave(webhookUrl);
    toast({ title: "Webhook configurado", description: "URL salva com sucesso!" });
  };

  const handleTestWebhook = async () => {
    const webhookUrl = form.getValues("webhookUrl");
    if (!webhookUrl) {
      toast({
        title: "Erro",
        description: "Informe a URL antes de testar.",
        variant: "destructive",
      });
      return;
    }

    setTestLoading(true);
    console.log("Testando webhook:", webhookUrl);
    
    const testDate = new Date();
    const startDateTime = testDate.toISOString();
    const endDateTime = new Date(testDate.getTime() + 60 * 60 * 1000).toISOString();
    
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors", 
        body: JSON.stringify({
          summary: "Reunião de Teste do Webhook",
          start: {
            dateTime: startDateTime
          },
          end: {
            dateTime: endDateTime
          },
          attendees: [{ email: "teste@exemplo.com", name: "Usuário de Teste" }],
          description: "Este é um teste de integração com o Zapier",
          
          // Campos adicionais para compatibilidade
          start_datetime: startDateTime,
          end_datetime: endDateTime,
          name: "Usuário de Teste",
          title: "Reunião de Teste do Webhook",
          location: "Online",
          
          // Campos para debug
          test: true,
          timestamp: new Date().toISOString(),
          message: "Este é um teste de webhook",
          display_date: format(testDate, "dd/MM/yyyy"),
          display_time: format(testDate, "HH:mm"),
          client_name: "Usuário de Teste"
        }),
      });
      
      toast({
        title: "Teste enviado com sucesso",
        description: "Verifique o 'Task History' no Zapier para confirmar.",
      });
    } catch (err: any) {
      console.error("Erro ao testar webhook:", err);
      toast({
        title: "Falha no teste",
        description: `Não foi possível disparar o webhook. ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Configuração do Webhook do Zapier</h2>
        <p className="text-muted-foreground">
          Integre notificações e automações via Zapier
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="webhookUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Webhook</FormLabel>
                <FormControl>
                  <Input placeholder={DEFAULT_WEBHOOK_URL} {...field} />
                </FormControl>
                <FormDescription>
                  URL do Zapier para integração (já configurada para você).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col md:flex-row gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestWebhook}
              disabled={testLoading}
              className="flex-1"
            >
              {testLoading ? "Testando…" : "Testar Webhook"}
            </Button>
            <Button type="submit" className="flex-1">
              Salvar Configuração
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
