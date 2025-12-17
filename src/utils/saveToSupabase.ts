import { supabase } from "@/integrations/supabase/client";
import { FormData } from "@/types/form";

/**
 * Converte os dados do formulário do formato do frontend para o formato do banco
 */
function mapFormDataToDatabase(formData: Partial<FormData>, email: string) {
  // Mapear gênero
  const genderMap: Record<string, "male" | "female" | "other" | "prefer_not_to_say"> = {
    masculino: "male",
    feminino: "female",
    outro: "other",
    "prefiro não dizer": "prefer_not_to_say",
  };

  // Mapear estado civil
  const maritalStatusMap: Record<string, "single" | "married" | "divorced" | "widowed" | "separated" | "union"> = {
    solteiro: "single",
    casado: "married",
    divorciado: "divorced",
    viúvo: "widowed",
    separado: "separated",
    união: "union",
  };

  return {
    email: email,
    age: formData.idade || 0,
    gender: genderMap[formData.sexo || ""] || "prefer_not_to_say",
    profession: formData.profissao || "",
    studying: formData.estudando || false,
    study_level: formData.nivelEstudo || null,
    marital_status: maritalStatusMap[formData.situacaoCivil || ""] || "single",
    has_children: formData.filhos || false,
    children_quantity: formData.quantidadeFilhos || null,
    state: "", // Campo removido do formulário, mantido para compatibilidade
    city: "", // Campo removido do formulário, mantido para compatibilidade
    neighborhood: null, // Campo removido do formulário, mantido para compatibilidade
    hand_photo_url: "", // Será preenchido após upload da foto
    main_objective_other: formData.objetivoPrincipalOutro || null,
    area_to_improve_other: formData.areaMelhorarOutro || null,
    current_challenge_other: formData.desafioAtualOutro || null,
  };
}

/**
 * Salva os dados do formulário no Supabase
 */
export async function saveFormDataToSupabase(
  formData: Partial<FormData>,
  email: string
): Promise<{ success: boolean; formDataId?: string; error?: string }> {
  try {
    // Validar email
    if (!email || !email.trim()) {
      return { success: false, error: "Email é obrigatório" };
    }

    // Mapear dados para o formato do banco
    const dbData = mapFormDataToDatabase(formData, email);

    // Inserir dados principais
    const { data: formDataRecord, error: formError } = await supabase
      .from("form_data")
      .insert(dbData)
      .select()
      .single();

    if (formError) {
      console.error("Erro ao salvar form_data:", formError);
      console.error("Detalhes do erro:", {
        code: formError.code,
        details: formError.details,
        hint: formError.hint,
        message: formError.message,
      });
      return { success: false, error: formError.message };
    }

    const formDataId = formDataRecord.id;

    // Salvar objetivos principais
    if (formData.objetivoPrincipal && formData.objetivoPrincipal.length > 0) {
      const objectives = formData.objetivoPrincipal.map((objective) => ({
        form_data_id: formDataId,
        objective: objective,
      }));

      const { error: objectivesError } = await supabase
        .from("form_data_main_objectives")
        .insert(objectives);

      if (objectivesError) {
        console.error("Erro ao salvar objetivos:", objectivesError);
        // Não falhar completamente, apenas logar o erro
      }
    }

    // Salvar áreas para melhorar
    if (formData.areaMelhorar && formData.areaMelhorar.length > 0) {
      const areas = formData.areaMelhorar.map((area) => ({
        form_data_id: formDataId,
        area: area,
      }));

      const { error: areasError } = await supabase
        .from("form_data_areas_to_improve")
        .insert(areas);

      if (areasError) {
        console.error("Erro ao salvar áreas:", areasError);
      }
    }

    // Salvar desafios atuais
    if (formData.desafioAtual && formData.desafioAtual.length > 0) {
      const challenges = formData.desafioAtual.map((challenge) => ({
        form_data_id: formDataId,
        challenge: challenge,
      }));

      const { error: challengesError } = await supabase
        .from("form_data_current_challenges")
        .insert(challenges);

      if (challengesError) {
        console.error("Erro ao salvar desafios:", challengesError);
      }
    }

    return { success: true, formDataId };
  } catch (error) {
    console.error("Erro inesperado ao salvar no Supabase:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Converte os dados do banco de dados para o formato do frontend
 */
function mapDatabaseToFormData(dbData: any): Partial<FormData> {
  // Mapear gênero de volta
  const genderMap: Record<string, string> = {
    male: "masculino",
    female: "feminino",
    other: "outro",
    prefer_not_to_say: "prefiro não dizer",
  };

  // Mapear estado civil de volta
  const maritalStatusMap: Record<string, string> = {
    single: "solteiro",
    married: "casado",
    divorced: "divorciado",
    widowed: "viúvo",
    separated: "separado",
    union: "união",
  };

  return {
    idade: dbData.age || 0,
    sexo: genderMap[dbData.gender] || "prefiro não dizer",
    profissao: dbData.profession || "",
    estudando: dbData.studying || false,
    nivelEstudo: dbData.study_level || undefined,
    situacaoCivil: maritalStatusMap[dbData.marital_status] || "solteiro",
    filhos: dbData.has_children || false,
    quantidadeFilhos: dbData.children_quantity || undefined,
    estado: dbData.state || "",
    cidade: dbData.city || "",
    bairro: dbData.neighborhood || undefined,
    objetivoPrincipalOutro: dbData.main_objective_other || undefined,
    areaMelhorarOutro: dbData.area_to_improve_other || undefined,
    desafioAtualOutro: dbData.current_challenge_other || undefined,
  };
}

/**
 * Busca os dados do formulário do Supabase usando o formDataId
 */
export async function fetchFormDataFromSupabase(
  formDataId: string
): Promise<{ success: boolean; formData?: Partial<FormData>; error?: string }> {
  try {
    // Buscar dados principais
    const { data: formDataRecord, error: formError } = await supabase
      .from("form_data")
      .select("*")
      .eq("id", formDataId)
      .single();

    if (formError || !formDataRecord) {
      console.error("Erro ao buscar form_data:", formError);
      return {
        success: false,
        error: formError?.message || "Dados do formulário não encontrados",
      };
    }

    // Converter dados do banco para formato do frontend
    const formData = mapDatabaseToFormData(formDataRecord);

    // Buscar objetivos principais
    const { data: objectivesData } = await supabase
      .from("form_data_main_objectives")
      .select("objective")
      .eq("form_data_id", formDataId);

    if (objectivesData && objectivesData.length > 0) {
      formData.objetivoPrincipal = objectivesData.map((obj) => obj.objective);
    }

    // Buscar áreas para melhorar
    const { data: areasData } = await supabase
      .from("form_data_areas_to_improve")
      .select("area")
      .eq("form_data_id", formDataId);

    if (areasData && areasData.length > 0) {
      formData.areaMelhorar = areasData.map((area) => area.area);
    }

    // Buscar desafios atuais
    const { data: challengesData } = await supabase
      .from("form_data_current_challenges")
      .select("challenge")
      .eq("form_data_id", formDataId);

    if (challengesData && challengesData.length > 0) {
      formData.desafioAtual = challengesData.map((challenge) => challenge.challenge);
    }

    return { success: true, formData };
  } catch (error) {
    console.error("Erro inesperado ao buscar do Supabase:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

