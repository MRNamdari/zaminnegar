import WorkflowStepper from '@/app/_components/dashboard/documents/WorkflowStepper';
import PersonalDocuments from '@/app/_components/dashboard/documents/PersonalDocuments';
import ParcelDocuments from '@/app/_components/dashboard/documents/ParcelDocuments';

export default function Page() {
  return (
    <section className="w-full min-w-0 p-3 sm:p-5 lg:p-6">
      {/* Workflow Stepper */}
      <div className="w-full min-w-0 overflow-x-auto">
        <WorkflowStepper />
      </div>

      {/* Documents */}
      <div
        className="
        mt-5 grid w-full min-w-0
        grid-cols-1 items-start gap-4
        rounded-2xl border border-border p-3
        sm:mt-6 sm:gap-5 sm:rounded-3xl sm:p-4
        lg:grid-cols-2
      "
      >
        <div className="w-full min-w-0">
          <PersonalDocuments />
        </div>

        <div className="w-full min-w-0">
          <ParcelDocuments />
        </div>
      </div>
    </section>
  );
}
