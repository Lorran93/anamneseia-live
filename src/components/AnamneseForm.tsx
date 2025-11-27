import { useState, useEffect } from "react";
import {
  User,
  AlertCircle,
  History,
  Stethoscope,
  Pill,
  Users,
  Heart,
  Brain,
  ClipboardList,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { AnamneseResponse } from "@/lib/webhookService";

interface AnamneseFormProps {
  data: AnamneseResponse | null;
}

export function AnamneseForm({ data }: AnamneseFormProps) {
  const [formData, setFormData] = useState({
    identificacao: "",
    queixaPrincipal: "",
    historiaDoencaAtual: "",
    interrogatorioSistematico: "",
    antecedentesPatologicos: "",
    antecedentesCirurgicos: "",
    medicamentosEmUso: "",
    antecedentesFamiliares: "",
    habitosVida: "",
    hipoteses: ["", "", ""],
    condutaSugerida: "",
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (data?.anamnese) {
      setFormData((prev) => ({
        ...prev,
        identificacao: data.anamnese?.identificacao || prev.identificacao,
        queixaPrincipal: data.anamnese?.queixa_principal || prev.queixaPrincipal,
        historiaDoencaAtual:
          data.anamnese?.historia_doenca_atual || prev.historiaDoencaAtual,
        interrogatorioSistematico:
          data.anamnese?.interrogatorio_sistematico || prev.interrogatorioSistematico,
        antecedentesPatologicos:
          data.anamnese?.antecedentes_pessoais?.patologicos ||
          prev.antecedentesPatologicos,
        antecedentesCirurgicos:
          data.anamnese?.antecedentes_pessoais?.cirurgicos ||
          prev.antecedentesCirurgicos,
        medicamentosEmUso:
          data.anamnese?.antecedentes_pessoais?.medicamentos ||
          prev.medicamentosEmUso,
        antecedentesFamiliares:
          data.anamnese?.antecedentes_familiares || prev.antecedentesFamiliares,
        habitosVida: data.anamnese?.habitos_vida || prev.habitosVida,
      }));
    }

    if (data?.raciocinio_clinico) {
      setFormData((prev) => ({
        ...prev,
        hipoteses: data.raciocinio_clinico?.hipoteses_diagnosticas || prev.hipoteses,
        condutaSugerida:
          data.raciocinio_clinico?.conduta_sugerida || prev.condutaSugerida,
      }));
    }
  }, [data]);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHipoteseChange = (index: number, value: string) => {
    const newHipoteses = [...formData.hipoteses];
    newHipoteses[index] = value;
    handleInputChange("hipoteses", newHipoteses);
  };

  const generateProntuarioText = (): string => {
    const lines = [
      "═══════════════════════════════════════════",
      "           PRONTUÁRIO MÉDICO",
      "═══════════════════════════════════════════",
      "",
      "▶ IDENTIFICAÇÃO:",
      formData.identificacao || "(não informado)",
      "",
      "▶ QUEIXA PRINCIPAL (QP):",
      formData.queixaPrincipal || "(não informado)",
      "",
      "▶ HISTÓRIA DA DOENÇA ATUAL (HDA):",
      formData.historiaDoencaAtual || "(não informado)",
      "",
      "▶ INTERROGATÓRIO SISTEMÁTICO (IS):",
      formData.interrogatorioSistematico || "(não informado)",
      "",
      "▶ ANTECEDENTES PESSOAIS:",
      `   • Patológicos: ${formData.antecedentesPatologicos || "(não informado)"}`,
      `   • Cirúrgicos: ${formData.antecedentesCirurgicos || "(não informado)"}`,
      `   • Medicamentos em uso: ${formData.medicamentosEmUso || "(não informado)"}`,
      "",
      "▶ ANTECEDENTES FAMILIARES:",
      formData.antecedentesFamiliares || "(não informado)",
      "",
      "▶ HÁBITOS DE VIDA E HISTÓRICO SOCIAL:",
      formData.habitosVida || "(não informado)",
      "",
      "═══════════════════════════════════════════",
      "           RACIOCÍNIO CLÍNICO",
      "═══════════════════════════════════════════",
      "",
      "▶ HIPÓTESES DIAGNÓSTICAS:",
      `   HD1: ${formData.hipoteses[0] || "(não definida)"}`,
      `   HD2: ${formData.hipoteses[1] || "(não definida)"}`,
      `   HD3: ${formData.hipoteses[2] || "(não definida)"}`,
      "",
      "▶ CONDUTA SUGERIDA:",
      formData.condutaSugerida || "(não definida)",
      "",
      "═══════════════════════════════════════════",
      `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
      "═══════════════════════════════════════════",
    ];

    return lines.join("\n");
  };

  const copyToClipboard = async () => {
    const text = generateProntuarioText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Prontuário copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o prontuário.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Seção A: Dados da Anamnese */}
      <div className="medical-card">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" />
          Dados da Anamnese
        </h2>

        <Accordion
          type="multiple"
          defaultValue={["identificacao", "qp", "hda"]}
          className="space-y-4"
        >
          <AccordionItem value="identificacao" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span>Identificação</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="form-field pt-2">
                <Label className="form-label">Dados do Paciente</Label>
                <Textarea
                  value={formData.identificacao}
                  onChange={(e) =>
                    handleInputChange("identificacao", e.target.value)
                  }
                  placeholder="Nome, idade, sexo, profissão, naturalidade..."
                  className="min-h-[80px]"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="qp" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                <span>QP - Queixa Principal</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="form-field pt-2">
                <Label className="form-label">Queixa Principal</Label>
                <Input
                  value={formData.queixaPrincipal}
                  onChange={(e) =>
                    handleInputChange("queixaPrincipal", e.target.value)
                  }
                  placeholder="Ex: Dor abdominal há 3 dias"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="hda" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <span>HDA - História da Doença Atual</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="form-field pt-2">
                <Label className="form-label">História da Doença Atual</Label>
                <Textarea
                  value={formData.historiaDoencaAtual}
                  onChange={(e) =>
                    handleInputChange("historiaDoencaAtual", e.target.value)
                  }
                  placeholder="Descreva a evolução da doença atual..."
                  className="min-h-[150px]"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="is" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" />
                <span>IS - Interrogatório Sistemático</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="form-field pt-2">
                <Label className="form-label">Interrogatório Sistemático</Label>
                <Textarea
                  value={formData.interrogatorioSistematico}
                  onChange={(e) =>
                    handleInputChange("interrogatorioSistematico", e.target.value)
                  }
                  placeholder="Revisão por sistemas..."
                  className="min-h-[120px]"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="antecedentes" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-primary" />
                <span>Antecedentes Pessoais</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="form-field">
                  <Label className="form-label">Patológicos</Label>
                  <Textarea
                    value={formData.antecedentesPatologicos}
                    onChange={(e) =>
                      handleInputChange("antecedentesPatologicos", e.target.value)
                    }
                    placeholder="Doenças prévias, internações..."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Cirúrgicos</Label>
                  <Textarea
                    value={formData.antecedentesCirurgicos}
                    onChange={(e) =>
                      handleInputChange("antecedentesCirurgicos", e.target.value)
                    }
                    placeholder="Cirurgias realizadas..."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="form-field">
                  <Label className="form-label">Medicamentos em Uso</Label>
                  <Textarea
                    value={formData.medicamentosEmUso}
                    onChange={(e) =>
                      handleInputChange("medicamentosEmUso", e.target.value)
                    }
                    placeholder="Lista de medicamentos atuais..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="familiares" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Antecedentes Familiares</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="form-field pt-2">
                <Label className="form-label">Antecedentes Familiares</Label>
                <Textarea
                  value={formData.antecedentesFamiliares}
                  onChange={(e) =>
                    handleInputChange("antecedentesFamiliares", e.target.value)
                  }
                  placeholder="Histórico familiar de doenças..."
                  className="min-h-[100px]"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="habitos" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                <span>Hábitos de Vida e Histórico Social</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="form-field pt-2">
                <Label className="form-label">Hábitos de Vida</Label>
                <Textarea
                  value={formData.habitosVida}
                  onChange={(e) =>
                    handleInputChange("habitosVida", e.target.value)
                  }
                  placeholder="Tabagismo, etilismo, atividade física, alimentação..."
                  className="min-h-[100px]"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Seção B: Raciocínio Clínico */}
      <div className="clinical-highlight">
        <h2 className="text-xl font-bold text-clinical-foreground mb-6 flex items-center gap-2">
          <Brain className="w-6 h-6" />
          Raciocínio Clínico
        </h2>

        <div className="space-y-6">
          <div className="form-field">
            <Label className="text-sm font-semibold text-clinical-foreground mb-3 block">
              Hipóteses Diagnósticas
            </Label>
            <div className="space-y-3">
              {["HD1", "HD2", "HD3"].map((label, index) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="font-semibold text-clinical-foreground w-12">
                    {label}:
                  </span>
                  <Input
                    value={formData.hipoteses[index] || ""}
                    onChange={(e) => handleHipoteseChange(index, e.target.value)}
                    placeholder={`Hipótese diagnóstica ${index + 1}`}
                    className="flex-1 bg-card"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-field">
            <Label className="text-sm font-semibold text-clinical-foreground mb-3 block">
              Conduta Sugerida
            </Label>
            <Textarea
              value={formData.condutaSugerida}
              onChange={(e) =>
                handleInputChange("condutaSugerida", e.target.value)
              }
              placeholder="Descreva a conduta sugerida para a hipótese principal..."
              className="min-h-[120px] bg-card"
            />
          </div>
        </div>
      </div>

      {/* Botão Flutuante */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={copyToClipboard}
          size="xl"
          variant={copied ? "recording" : "default"}
          className="shadow-medical-lg"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copiar Prontuário para PEP
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
