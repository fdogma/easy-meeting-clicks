
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Command, CommandInput } from "@/components/ui/command";

// Schema for form validation
const formSchema = z.object({
  webhookUrl: z.string().url({
    message: "https://hooks.zapier.com/hooks/catch/22657275/2p3dg0d/",
  }),
});

type ZapierWebhookSettingsProps = {
  onSave: (url: string) => void;
  initialValue?: string;
};

export const ZapierWebhookSettings = ({
  onSave,
  initialValue = "",
}: ZapierWebhookSettingsProps) => {
  const { toast } = useToast();
  const [testLoading, setTestLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      webhookUrl: initialValue || "",
    },
  });

  useEffect(() => {
    if (initialValue) {
      form.reset({ webhookUrl: initialValue });
    }
  }, [initialValue, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values.webhookUrl);
    toast({
      title: "Webhook configurado",
      description: "URL do webhook do Zapier foi salva com sucesso!",
    });
  };

  const handleTestWebhook = async () => {
    const webhookUrl = form.getValues("webhookUrl");
    
    if (!webhookUrl) {
      toast({
        title: "Erro",
        description: "https://hooks.zapier.com/hooks/catch/22657275/2p3dg0d/",
        variant: "destructive",
      });
      return;
    }

    setTestLoading(true);
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Para lidar com CORS
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: "Este é um teste da configuração do webhook",
        }),
      });
      
      toast({
        title: "Teste enviado",
        description: "O teste foi enviado para o Zapier. Verifique o histórico do seu Zap.",
      });
    } catch (error) {
      console.error("Erro ao testar webhook:", error);
      toast({
        title: "Erro",
        description: "Não foi possível testar o webhook. Verifique a URL e tente novamente.",
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
          Configure a integração com o Zapier para automatizar notificações e agendamentos
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="webhookUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Webhook do Zapier</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://hooks.zapier.com/hooks/catch/22657275/2p3dg0d/" 
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Cole a URL do webhook que você obteve no Zapier ao configurar um trigger de webhook.
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
              {testLoading ? "Testando..." : "Testar Webhook"}
            </Button>
            <Button type="submit" className="flex-1">
              Salvar Configuração
            </Button>
          </div>
        </form>
      </Form>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-lg">Guia de Configuração</h3>
        <div className="space-y-2 text-sm">
          <p>1. Acesse sua conta do Zapier e crie um novo Zap</p>
          <p>2. Selecione "Webhook by Zapier" como trigger (gatilho)</p>
          <p>3. Escolha "Catch Hook" como evento do trigger</p>
          <p>4. Copie a URL do webhook fornecida pelo Zapier</p>
          <p>5. Cole a URL no campo acima e clique em Salvar</p>
          <p>6. Complete a configuração do seu Zap no Zapier adicionando as ações desejadas</p>
        </div>
        
        <div className="bg-slate-50 p-2 rounded-md">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">Dica para usuários Mac:</span> Para colar a URL do webhook, use <span className="bg-slate-200 px-1 rounded">⌘+V</span> (Command+V)
          </p>
        </div>
      </div>
    </div>
  );
};
