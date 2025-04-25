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

/**
 * URL fixa do Webhook Zapier fornecido pelo cliente.
 * Altere aqui se precisar atualizar futuramente.
 */
export const DEFAULT_WEBHOOK_URL =
  "https://hooks.zapier.com/hooks/catch/22657275/2p3dg0d/";

// Validação do formulário (exige URL válida e que pertença ao domínio Zapier)
const formSchema = z.object({
  webhookUrl: z
    .string()
    .url({ message: "Informe uma URL válida (https://…)" })
    .regex(
      /^https:\/\/hooks\.zapier\.com\/hooks\/catch\/[A-Za-z0-9/_-]+\/?$/,
      "A URL precisa ser um Webhook Zapier"
    ),
});

type ZapierWebhookSettingsProps = {
  /** Função chamada após salvar */
  onSave: (url: string) => void;
  /** Valor inicial opcional (padrão = DEFAULT_WEBHOOK_URL) */
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
    form.reset({ webhookUrl: initialValue });
  }, [initialValue, form]);

  /** Salva a configuração do webhook */
  const onSubmit = ({ webhookUrl }: z.infer<typeof formSchema>) => {
    onSave(webhookUrl);
    toast({
      title: "Webhook configurado",
      description: "URL salva com sucesso!",
    });
  };

  /** Envia um POST de teste para o Zapier */
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
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors", // Zapier ignora CORS e não devolve corpo
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: "Webhook de teste disparado",
        }),
      });

      toast({
        title: "Teste enviado",
        description: "Verifique em Task History se o Zap recebeu o webhook.",
      });
    } catch (err) {
      console.error("Erro ao testar webhook:", err);
      toast({
        title: "Falha no teste",
        description: "Não foi possível disparar o webhook. Revise a URL e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      {/* Cabeçalho */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Configuração do Webhook do Zapier</h2>
        <p className="text-muted-foreground">
          Integre notificações e automações via Zapier
        </p>
      </div>

      {/* Formulário */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="webhookUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Webhook</FormLabel>
                <FormControl>
                  <Input
                    placeholder={DEFAULT_WEBHOOK_URL}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Cole aqui a URL gerada pelo Zapier (gatilho “Catch Hook”).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botões */}
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
