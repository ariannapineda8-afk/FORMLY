import FormBuilder from "@/components/FormBuilder";

export default function EditFormPage({ params }) {
  return (
    <div>
      <h1 className="page-title mb-5">Editar formulario</h1>
      <FormBuilder formId={params.id} />
    </div>
  );
}
