import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarClock,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  FileCheck2,
  Flag,
  GraduationCap,
  Loader2,
  Pencil,
  School,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.js";
import Badge from "../../components/ui/Badge.js";
import Button from "../../components/ui/Button.js";
import Card from "../../components/ui/Card.js";
import Modal from "../../components/ui/Modal.js";
import type { Program } from "../../features/programs/programs.api.js";
import {
  EVIDENCE_LABEL,
  STUDY_LEVEL_LABEL,
  VERIFICATION_LABEL,
  formatDate,
  formatTuition,
  intakeLabel,
  nextDeadline,
} from "../../features/programs/programs.format.js";
import {
  useProgram,
  useReportOutdated,
  useVerifyProgram,
} from "../../features/programs/usePrograms.js";
import { apiErrorMessage } from "../../lib/api/errors.js";
import { useAuthStore } from "../../store/authStore.js";

const MANAGE_ROLES = ["ADMIN", "OPERATIONS"];

const ProgramDetailPage = () => {
  const { programId } = useParams();
  const { data: program, isLoading, isError, error } = useProgram(programId);
  const canManage = useAuthStore((state) =>
    state.user ? MANAGE_ROLES.includes(state.user.role) : false,
  );
  const [isReportOpen, setIsReportOpen] = useState(false);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-[#045A58]" size={32} />
        </div>
      </AppShell>
    );
  }

  if (isError || !program) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="text-[#DC2626]" size={28} />
          <p className="text-sm text-[#6B7280]">
            {apiErrorMessage(error, "Failed to load this program")}
          </p>
          <Link
            className="text-sm font-semibold text-[#045A58] hover:text-[#034A48]"
            to="/programs"
          >
            Back to Programs
          </Link>
        </div>
      </AppShell>
    );
  }

  const deadline = nextDeadline(program.intakes);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#045A58] transition hover:text-[#034A48]"
              to="/programs"
            >
              <ArrowLeft size={16} />
              Programs
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-normal text-[#111827]">
                {program.qualification} {program.name}
              </h1>
              <Badge tone="brand">
                {STUDY_LEVEL_LABEL[program.studyLevel]}
              </Badge>
              <Badge tone="neutral">{program.publicId}</Badge>
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-6 text-[#6B7280]">
              <span>{program.school.name}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5 font-medium text-[#374151]">
                {program.verificationStatus === "VERIFIED" ? (
                  <BadgeCheck className="text-[#166534]" size={15} />
                ) : program.verificationStatus === "NEEDS_RECHECK" ? (
                  <AlertTriangle className="text-[#B45309]" size={15} />
                ) : (
                  <AlertCircle className="text-[#9CA3AF]" size={15} />
                )}
                {VERIFICATION_LABEL[program.verificationStatus]}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              leftIcon={<Flag size={17} />}
              onClick={() => setIsReportOpen(true)}
              size="md"
              variant="secondary"
            >
              Report outdated
            </Button>
            {canManage ? (
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-transparent bg-[#045A58] px-4 text-sm font-semibold text-white outline-none transition hover:bg-[#034A48] focus:ring-4 focus:ring-[#E6F4F3]"
                to={`/programs/${program.publicId}/edit`}
              >
                <Pencil size={17} />
                Edit program
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={GraduationCap}
            label="Study level"
            value={STUDY_LEVEL_LABEL[program.studyLevel]}
          />
          <SummaryCard
            icon={CircleDollarSign}
            label={
              program.feesAcademicYear
                ? `Tuition ${program.feesAcademicYear}`
                : "Tuition per year"
            }
            value={formatTuition(program)}
          />
          <SummaryCard
            icon={Clock3}
            label="Duration"
            value={program.duration}
          />
          <SummaryCard
            icon={CalendarClock}
            label="Next deadline"
            value={formatDate(deadline)}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <VerificationCard canManage={canManage} program={program} />

            <Card>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">
                    Entry requirements
                  </h2>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    From the official course page.
                  </p>
                </div>
                <FileCheck2 className="text-[#045A58]" size={20} />
              </div>

              <div className="space-y-4">
                <RequirementItem
                  icon={<GraduationCap size={18} />}
                  label="Academic requirements"
                  value={program.academicRequirements}
                />
                <RequirementItem
                  icon={<BookOpen size={18} />}
                  label="English requirements"
                  value={program.englishRequirements}
                />
              </div>
            </Card>

            <Card>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">
                    Operational notes
                  </h2>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Internal context for advisors and operations staff.
                  </p>
                </div>
                <Sparkles className="text-[#045A58]" size={20} />
              </div>
              <p className="whitespace-pre-line text-sm leading-6 text-[#374151]">
                {program.operationNotes ?? "No notes yet."}
              </p>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">
                    School
                  </h2>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Program ownership.
                  </p>
                </div>
                <Building2 className="text-[#045A58]" size={20} />
              </div>

              <Link
                className="block rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 outline-none transition hover:border-[#B7D8D6] hover:bg-[#E6F4F3] focus:ring-4 focus:ring-[#E6F4F3]"
                to={`/schools/${program.school.publicId}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#045A58]">
                    <School size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">
                      {program.school.name}
                    </p>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      {program.school.publicId}
                    </p>
                  </div>
                </div>
              </Link>
            </Card>

            <Card>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">
                    Intakes and deadlines
                  </h2>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    When students can start.
                  </p>
                </div>
                <CalendarDays className="text-[#045A58]" size={20} />
              </div>

              {program.intakes.length === 0 ? (
                <p className="text-sm text-[#6B7280]">No intakes recorded.</p>
              ) : (
                <ul className="divide-y divide-[#E5E7EB]">
                  {program.intakes.map((intake) => (
                    <li
                      className="flex items-center justify-between gap-4 py-3"
                      key={`${intake.month}-${intake.year}`}
                    >
                      <span className="text-sm font-semibold text-[#111827]">
                        {intakeLabel(intake)}
                      </span>
                      <span className="text-sm text-[#6B7280]">
                        Deadline {formatDate(intake.applicationDeadline)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">
                    Tuition and funding
                  </h2>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    International fees.
                  </p>
                </div>
                <CircleDollarSign className="text-[#045A58]" size={20} />
              </div>

              <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">
                  {program.feesAcademicYear
                    ? `Per year, ${program.feesAcademicYear}`
                    : "Per year"}
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#111827]">
                  {formatTuition(program)}
                </p>
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <span className="text-sm text-[#6B7280]">Scholarships</span>
                <span className="max-w-[60%] text-right text-sm font-semibold text-[#111827]">
                  {program.scholarshipAvailability ?? "Not recorded"}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ReportOutdatedModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        programId={program.publicId}
      />
    </AppShell>
  );
};

const VerificationCard = ({
  canManage,
  program,
}: {
  canManage: boolean;
  program: Program;
}) => {
  const verify = useVerifyProgram(program.publicId);
  const evidence = Object.entries(program.evidence ?? {});

  return (
    <Card>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">Data check</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Where these facts come from, and when a person last confirmed them.
          </p>
        </div>
        <ShieldCheck className="text-[#045A58]" size={20} />
      </div>

      {program.verificationStatus === "VERIFIED" ? (
        <StatusLine tone="success" icon={<BadgeCheck size={18} />}>
          Verified {formatDate(program.verifiedAt)}
          {program.verifiedBy ? ` by ${program.verifiedBy.fullName}` : ""}
        </StatusLine>
      ) : program.verificationStatus === "NEEDS_RECHECK" ? (
        <StatusLine tone="warning" icon={<AlertTriangle size={18} />}>
          Needs re-check: someone reported it as outdated, or the official page
          changed.
        </StatusLine>
      ) : (
        <StatusLine tone="neutral" icon={<AlertCircle size={18} />}>
          Not verified yet. Check every fee and requirement against the course
          page before relying on it.
        </StatusLine>
      )}

      <div className="mt-5 grid gap-4 border-t border-[#E5E7EB] pt-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">
            Official source
          </p>
          {program.sourceUrl ? (
            <a
              className="mt-1 inline-flex max-w-full items-center gap-1.5 break-all text-sm font-semibold text-[#045A58] hover:text-[#034A48]"
              href={program.sourceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {program.sourceUrl}
              <ExternalLink className="shrink-0" size={14} />
            </a>
          ) : (
            <p className="mt-1 text-sm font-semibold text-[#111827]">
              Not added yet
            </p>
          )}
        </div>
        <DetailItem
          label="Fees for year"
          value={program.feesAcademicYear ?? "—"}
        />
        <DetailItem
          label="Last automatic check"
          value={formatDate(program.lastCheckedAt)}
        />
      </div>

      {evidence.length > 0 ? (
        <div className="mt-5 space-y-3 border-t border-[#E5E7EB] pt-5">
          <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">
            Quoted from the source
          </p>
          {evidence.map(([field, quote]) => (
            <blockquote
              className="rounded-xl border-l-4 border-[#B7D8D6] bg-[#F9FAFB] px-4 py-3"
              key={field}
            >
              <p className="text-xs font-semibold text-[#6B7280]">
                {EVIDENCE_LABEL[field] ?? field}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#374151]">“{quote}”</p>
            </blockquote>
          ))}
        </div>
      ) : null}

      {canManage && program.verificationStatus !== "VERIFIED" ? (
        <div className="mt-5 border-t border-[#E5E7EB] pt-5">
          <Button
            disabled={verify.isPending || !program.sourceUrl}
            leftIcon={<BadgeCheck size={17} />}
            onClick={() => verify.mutate()}
            size="md"
          >
            {verify.isPending
              ? "Saving…"
              : "I checked it against the course page today"}
          </Button>
          {!program.sourceUrl ? (
            <p className="mt-2 text-sm text-[#6B7280]">
              Add the course page link (Edit program) first.
            </p>
          ) : null}
          {verify.isError ? (
            <p className="mt-2 text-sm text-[#991B1B]" role="alert">
              {apiErrorMessage(verify.error)}
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
};

const STATUS_LINE_CLASSES = {
  success: "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]",
  warning: "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]",
  neutral: "border-[#E5E7EB] bg-[#F9FAFB] text-[#374151]",
} as const;

const StatusLine = ({
  children,
  icon,
  tone,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  tone: keyof typeof STATUS_LINE_CLASSES;
}) => (
  <div
    className={`flex items-start gap-3 rounded-xl border p-4 text-sm font-medium leading-6 ${STATUS_LINE_CLASSES[tone]}`}
  >
    <span className="mt-0.5 shrink-0">{icon}</span>
    <span>{children}</span>
  </div>
);

const ReportOutdatedModal = ({
  isOpen,
  onClose,
  programId,
}: {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
}) => {
  const report = useReportOutdated(programId);
  const [message, setMessage] = useState("");

  const close = () => {
    setMessage("");
    report.reset();
    onClose();
  };

  return (
    <Modal
      description="Tell the team what looks wrong. They'll check it against the official course page."
      isOpen={isOpen}
      onClose={close}
      title="Report outdated data"
    >
      <div className="px-6 py-5">
        {report.isSuccess ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[#374151]">
              Thanks. The team will check this programme.
            </p>
            <div className="flex justify-end">
              <Button onClick={close} size="md">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              report.mutate(message.trim());
            }}
          >
            <div>
              <label
                className="mb-2 block text-sm font-medium text-[#111827]"
                htmlFor="report-message"
              >
                What looks wrong?
              </label>
              <textarea
                className="w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#045A58] focus:ring-4 focus:ring-[#E6F4F3]"
                id="report-message"
                maxLength={2000}
                minLength={5}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="e.g. Tuition is now £32,500 for 2027/28, per the course page."
                required
                rows={4}
                value={message}
              />
            </div>
            {report.isError ? (
              <p className="text-sm text-[#991B1B]" role="alert">
                {apiErrorMessage(report.error)}
              </p>
            ) : null}
            <div className="flex justify-end gap-3">
              <Button
                onClick={close}
                size="md"
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
              <Button disabled={report.isPending} size="md" type="submit">
                {report.isPending ? "Sending…" : "Send report"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

type SummaryCardProps = {
  icon: typeof BookOpen;
  label: string;
  value: string;
};

const SummaryCard = ({ icon: Icon, label, value }: SummaryCardProps) => (
  <Card className="p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-[#6B7280]">{label}</p>
        <p className="mt-3 text-lg font-semibold text-[#111827]">{value}</p>
      </div>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#045A58]">
        <Icon size={20} />
      </div>
    </div>
  </Card>
);

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-[#111827]">{value}</p>
  </div>
);

const RequirementItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) => (
  <div className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#045A58]">
      {icon}
    </div>
    <div>
      <p className="text-sm font-semibold text-[#111827]">{label}</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#6B7280]">
        {value ?? "Not recorded yet."}
      </p>
    </div>
  </div>
);

export default ProgramDetailPage;
