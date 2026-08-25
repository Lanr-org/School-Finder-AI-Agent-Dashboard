import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { isAxiosError } from 'axios'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import { api } from '../../lib/api/client.js'
import type { ApiErrorResponse } from '../../lib/api/types.js'

type RequestState = 'idle' | 'submitting' | 'sent'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [requestState, setRequestState] = useState<RequestState>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setRequestState('submitting')

    try {
      await api.post('/auth/forgot-password', { email })
      setRequestState('sent')
    } catch (err) {
      const message = isAxiosError<ApiErrorResponse>(err)
        ? (err.response?.data.error.message ?? 'Failed to send reset link')
        : 'Failed to send reset link'
      setError(message)
      setRequestState('idle')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] px-4 py-8 text-[#111827] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="w-full max-w-[480px]">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
              <GraduationCap size={23} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">School Finder AI</p>
              <p className="text-xs font-medium text-[#6B7280]">Staff Portal</p>
            </div>
          </div>

          <Card
            className="w-full overflow-hidden rounded-[24px] shadow-[0_20px_60px_rgba(17,24,39,0.08)]"
            padded={false}
          >
            {requestState === 'sent' ? (
              <section className="p-6 text-center sm:p-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
                  <CheckCircle2 size={26} />
                </div>
                <h1 className="mt-5 text-2xl font-semibold tracking-normal text-[#111827]">Check your email</h1>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#6B7280]">
                  If an account exists for <span className="font-semibold text-[#374151]">{email}</span>, a password reset link has been sent.
                </p>

                <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-left">
                  <p className="text-sm font-semibold text-[#111827]">Next steps</p>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                    Open the email link before it expires. Check your spam folder if it does not arrive after a few minutes.
                  </p>
                </div>

                <Link
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-[#045A58] px-5 text-sm font-semibold text-white outline-none transition hover:bg-[#034A48] focus:ring-4 focus:ring-[#E6F4F3]"
                  to="/login"
                >
                  Return to sign in
                  <ArrowRight size={18} />
                </Link>

                <button
                  className="mt-4 text-sm font-semibold text-[#045A58] transition hover:text-[#034A48]"
                  onClick={() => setRequestState('idle')}
                  type="button"
                >
                  Use a different email
                </button>
              </section>
            ) : (
              <section className="p-6 sm:p-10">
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#045A58] transition hover:text-[#034A48]"
                  to="/login"
                >
                  <ArrowLeft size={16} />
                  Back to sign in
                </Link>

                <div className="mb-7 mt-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
                    <Mail size={21} />
                  </div>
                  <p className="mb-2 mt-5 text-sm font-medium text-[#045A58]">Account recovery</p>
                  <h1 className="text-2xl font-semibold tracking-normal text-[#111827]">Reset your password</h1>
                  <p className="mt-3 text-sm leading-6 text-[#6B7280]">
                    Enter your company email. We will send a secure, time-limited password reset link.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {error ? (
                    <div className="flex items-start gap-2 rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">
                      <AlertCircle className="mt-0.5 shrink-0" size={16} />
                      <span>{error}</span>
                    </div>
                  ) : null}

                  <Input
                    autoComplete="email"
                    id="recovery-email"
                    label="Work email"
                    leftIcon={<Mail size={18} />}
                    name="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="advisor@company.com"
                    required
                    type="email"
                    value={email}
                  />

                  <Button
                    className="w-full"
                    disabled={requestState === 'submitting'}
                    rightIcon={
                      requestState === 'submitting' ? (
                        <LoaderCircle className="animate-spin" size={18} />
                      ) : (
                        <ArrowRight size={18} />
                      )
                    }
                    size="lg"
                    type="submit"
                  >
                    {requestState === 'submitting' ? 'Sending reset link' : 'Send reset link'}
                  </Button>
                </form>

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#B9DAD8] bg-[#F2F9F8] p-4">
                  <ShieldCheck className="mt-0.5 shrink-0 text-[#045A58]" size={18} />
                  <p className="text-xs leading-5 text-[#52605F]">
                    For security, this page does not confirm whether an email address belongs to a staff account.
                  </p>
                </div>
              </section>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
