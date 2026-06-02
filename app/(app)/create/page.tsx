import { CreateForm } from "./_components/CreateForm";
import { PageHeader } from "./_components/PageHeader";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-6">
      <PageHeader />
      <CreateForm />
    </div>
  );
}
