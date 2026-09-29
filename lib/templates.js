function build(prefix, items) {
  return items.map((it) => ({
    label: "",
    required: false,
    options: "",
    ...it,
    id: prefix + "_" + it.id,
    showIf: it.showIf ? { ...it.showIf, fieldId: prefix + "_" + it.showIf.fieldId } : undefined,
  }));
}

const escala = (id, label) => ({ id, type: "escala", label, required: true });

export const TEMPLATE_LIST = [
  {
    key: "blanco",
    name: "En blanco",
    description: "Empieza desde cero y agrega los campos que necesites.",
    accent: "slate",
  },
  {
    key: "vacante",
    name: "Solicitud de vacante",
    description: "Datos personales, formación, experiencia laboral y disponibilidad.",
    accent: "blue",
  },
  {
    key: "evaluacion",
    name: "Evaluación de desempeño",
    description: "Competencias del 1 al 5, comentarios y firma del evaluador.",
    accent: "mint",
  },
  {
    key: "encuesta",
    name: "Encuesta de satisfacción",
    description: "Valoración general, aspectos destacados y sugerencias.",
    accent: "amber",
  },
];

export function getTemplate(key) {
  switch (key) {
    case "vacante":
      return {
        title: "Solicitud de vacante",
        description: "Completa tus datos. Toda la información será tratada de forma confidencial.",
        buttonText: "Enviar solicitud",
        thanksMessage: "Gracias por postularte. Nuestro equipo revisará tu información y se pondrá en contacto contigo.",
        fields: build("v", [
          { id: "s1", type: "seccion", label: "DATOS GENERALES" },
          { id: "nombre", type: "corta", label: "Nombre completo", required: true },
          { id: "edad", type: "numero", label: "Edad", required: true },
          { id: "residencia", type: "corta", label: "¿Dónde reside actualmente?", required: true },
          { id: "telefono", type: "telefono", label: "Número de teléfono", required: true },
          { id: "correo", type: "email", label: "Correo electrónico" },
          { id: "s2", type: "seccion", label: "FORMACIÓN" },
          {
            id: "nivel",
            type: "desplegable",
            label: "Nivel académico alcanzado",
            required: true,
            options: ["Bachiller", "Técnico", "Grado universitario", "Postgrado / Maestría"],
          },
          { id: "s3", type: "seccion", label: "EXPERIENCIA LABORAL" },
          { id: "exp", type: "sinono", label: "¿Cuenta con experiencia laboral?", required: true },
          {
            id: "empresa",
            type: "corta",
            label: "Actual o última empresa en la que laboró",
            required: true,
            showIf: { fieldId: "exp", op: "eq", value: "Sí" },
          },
          {
            id: "posicion",
            type: "corta",
            label: "¿Qué posición ocupa u ocupaba?",
            required: true,
            showIf: { fieldId: "exp", op: "eq", value: "Sí" },
          },
          {
            id: "salario",
            type: "corta",
            label: "Actual o último salario",
            showIf: { fieldId: "exp", op: "eq", value: "Sí" },
          },
          {
            id: "tiempo",
            type: "corta",
            label: "¿Cuánto tiempo tiene o tenía en la empresa?",
            showIf: { fieldId: "exp", op: "eq", value: "Sí" },
          },
          {
            id: "salida",
            type: "larga",
            label: "Motivo de salida",
            showIf: { fieldId: "exp", op: "eq", value: "Sí" },
          },
          { id: "s4", type: "seccion", label: "DISPONIBILIDAD" },
          { id: "horario", type: "sinono", label: "¿Tiene disponibilidad para horario rotativo?", required: true },
          { id: "inicio", type: "fecha", label: "¿A partir de qué fecha podría iniciar?" },
          { id: "cv", type: "archivo", label: "Adjunta tu currículum (opcional)" },
        ]),
      };
    case "evaluacion":
      return {
        title: "Evaluación de desempeño",
        description: "Evalúa cada competencia del 1 al 5, donde 1 es «Necesita mejorar» y 5 es «Excelente».",
        buttonText: "Enviar evaluación",
        thanksMessage: "Evaluación registrada correctamente. Gracias.",
        fields: build("e", [
          { id: "s1", type: "seccion", label: "DATOS DE LA EVALUACIÓN" },
          { id: "colaborador", type: "corta", label: "Nombre del colaborador", required: true },
          { id: "puesto", type: "corta", label: "Puesto" },
          { id: "evaluador", type: "corta", label: "Nombre del evaluador", required: true },
          { id: "periodo", type: "fecha", label: "Fecha de la evaluación", required: true },
          { id: "s2", type: "seccion", label: "COMPETENCIAS" },
          escala("c1", "Calidad del trabajo"),
          escala("c2", "Cumplimiento de objetivos"),
          escala("c3", "Trabajo en equipo"),
          escala("c4", "Comunicación"),
          escala("c5", "Puntualidad y asistencia"),
          { id: "s3", type: "seccion", label: "COMENTARIOS" },
          { id: "fortalezas", type: "larga", label: "Principales fortalezas" },
          { id: "mejoras", type: "larga", label: "Áreas de mejora" },
          { id: "plan", type: "larga", label: "Plan de acción acordado" },
          { id: "firma", type: "firma", label: "Firma del evaluador", required: true },
        ]),
      };
    case "encuesta":
      return {
        title: "Encuesta de satisfacción",
        description: "Tu opinión nos ayuda a mejorar. Toma menos de dos minutos.",
        buttonText: "Enviar encuesta",
        thanksMessage: "¡Gracias por compartir tu opinión!",
        fields: build("n", [
          escala("satisf", "En general, ¿qué tan satisfecho(a) está con nuestro servicio? (1 = muy insatisfecho, 5 = muy satisfecho)"),
          {
            id: "valora",
            type: "multiple",
            label: "¿Qué aspectos valora más?",
            options: ["Atención del personal", "Rapidez", "Calidad", "Precio", "Comunicación"],
          },
          { id: "recomienda", type: "sinono", label: "¿Nos recomendaría?", required: true },
          {
            id: "gusto",
            type: "larga",
            label: "¿Qué fue lo que más le gustó?",
            showIf: { fieldId: "recomienda", op: "eq", value: "Sí" },
          },
          {
            id: "mejora",
            type: "larga",
            label: "¿Qué podríamos mejorar?",
            required: true,
            showIf: { fieldId: "recomienda", op: "eq", value: "No" },
          },
          { id: "comentarios", type: "larga", label: "Comentarios adicionales (opcional)" },
        ]),
      };
    default:
      return null;
  }
}
