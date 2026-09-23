import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { isAxiosError } from 'axios'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button.js'
import Card from '../../components/ui/Card.js'
import Input from '../../components/ui/Input.js'
import { api } from '../../lib/api/client.js'
import type { ApiErrorResponse, ApiSuccessResponse } from '../../lib/api/types.js'
import { useAuthStore } from '../../store/authStore.js'

type ResetState = 'validating' | 'valid' | 'invalid' | 'expired' | 'submitting' | 'success'
type ResetErrorState = Extract<ResetState, 'expired' | 'invalid'>

const resetErrors: Record<ResetErrorState, { description: string; title: string }> = {
  expired: {
    description: 'This password reset link has expired. Request a new link to continue.',
    title: 'Reset link expired',
  },
  invalid: {
    description:
      'This password reset link is not valid. Check that you opened the complete link from your email, or it may have already been used.',
    title: 'Invalid reset link',
  },
}

const errorCode = (error: unknown): string | undefined =>
  isAxiosError<ApiErrorResponse>(error) ? error.response?.data.error.code : undefined

const errorMessage = (error: unknown, fallback: string): string =>
  isAxiosError<ApiErrorResponse>(error) ? (error.response?.data.error.message ?? fallback) : fallback

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const { token } = useParams()
  const [resetState, setResetState] = useState<ResetState>('validating')
  const [resetEmail, setResetEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setResetState('invalid')
      return
    }

    api
      .get<ApiSuccessResponse<{ fullName: string; email: string }>>(`/auth/reset-password/${token}`)
      .then((res) => {
        setResetEmail(res.data.data.email)
        setResetState('valid')
      })
      .catch((error: unknown) => {
        setResetState(errorCode(error) === 'TOKEN_EXPIRED' ? 'expired' : 'invalid')
      })
  }, [token])

  const requirements = useMemo(
    () => [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'One lowercase letter', met: /[a-z]/.test(password) },
      { label: 'One number', met: /\d/.test(password) },
    ],
    [password],
  )

  const passwordIsValid = requirements.every((requirement) => requirement.met)
  const passwordsMatch = password.length > 0 && password === confirmPassword

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setSubmitError(null)

    if (!passwordIsValid || !passwordsMatch || !token) return

    setResetState('submitting')

    try {
      await api.post(`/auth/reset-password/${token}`, {
        newPassword: password,
        confirmNewPassword: confirmPassword,
      })
      // The backend clears the refresh cookie on a successful reset, ending any active session.
      useAuthStore.getState().logout()
      setResetState('success')
    } catch (error) {
      if (errorCode(error) === 'TOKEN_EXPIRED') {
        setResetState('expired')
      } else {
        setSubmitError(errorMessage(error, 'Failed to reset password'))
        setResetState('valid')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] px-4 py-8 text-[#111827] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="w-full max-w-[520px]">
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
            {resetState === 'validating' ? (
              <StatusPanel
                description="Checking that your password reset link is valid and ready to use."
                icon={<LoaderCircle className="animate-spin" size={25} />}
                title="Validating reset link"
              />
            ) : resetState === 'invalid' || resetState === 'expired' ? (
              <ErrorPanel state={resetState} />
            ) : resetState === 'success' ? (
              <SuccessPanel onContinue={() => navigate('/login')} />
            ) : (
              <section className="p-6 sm:p-10">
                <div className="mb-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">
                    <ShieldCheck size={22} />
                  </div>
                  <p className="mb-2 mt-5 text-sm font-medium text-[#045A58]">Account recovery</p>
                  <h1 className="text-2xl font-semibold tracking-normal text-[#111827]">Choose a new password</h1>
                  <p className="mt-3 text-sm leading-6 text-[#6B7280]">
                    Replace your existing password. Your account role, permissions, and status will not change.
                  </p>
                </div>

                <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <Mail className="mt-0.5 shrink-0 text-[#045A58]" size={18} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-normal text-[#9CA3AF]">Resetting for</p>
                    <p className="mt-1 break-words text-sm font-semibold text-[#111827]">{resetEmail}</p>
                  </div>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {submitError ? (
                    <div className="flex items-start gap-2 rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">
                      <AlertCircle className="mt-0.5 shrink-0" size={16} />
                      <span>{submitError}</span>
                    </div>
                  ) : null}

                  <Input
                    autoComplete="new-password"
                    {...(submitted && !passwordIsValid
                      ? { error: 'Your new password does not meet all requirements.' }
                      : {})}
                    id="reset-password"
                    label="New password"
                    leftIcon={<LockKeyhole size={18} />}
                    name="password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a secure password"
                    required
                    rightSlot={
                      <PasswordVisibilityButton
                        label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((visible) => !visible)}
                        visible={showPassword}
                      />
                    }
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                  />

                  <div className="grid gap-2 sm:grid-cols-2">
                    {requirements.map((requirement) => (
                      <div
                        className={`flex items-center gap-2 text-xs font-medium ${
                          requirement.met ? 'text-[#166534]' : 'text-[#6B7280]'
                        }`}
                        key={requirement.label}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                            requirement.met ? 'bg-[#DCFCE7]' : 'bg-[#E5E7EB]'
                          }`}
                        >
                          <Check size={11} strokeWidth={3} />
                        </span>
                        {requirement.label}
                      </div>
                    ))}
                  </div>

                  <Input
                    autoComplete="new-password"
                    {...(submitted && !passwordsMatch
                      ? { error: 'Enter the same new password in both fields.' }
                      : {})}
                    id="confirm-reset-password"
                    label="Confirm new password"
                    leftIcon={<LockKeyhole size={18} />}
                    name="confirmPassword"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Enter your new password again"
                    required
                    rightSlot={
                      <PasswordVisibilityButton
                        label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowConfirmPassword((visible) => !visible)}
                        visible={showConfirmPassword}
                      />
                    }
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                  />

                  <Button
                    className="w-full"
                    disabled={resetState === 'submitting'}
                    rightIcon={
                      resetState === 'submitting' ? (
                        <LoaderCircle className="animate-spin" size={18} />
                      ) : (
                        <ArrowRight size={18} />
                      )
                    }
                    size="lg"
                    type="submit"
                  >
                    {resetState === 'submitting' ? 'Updating password' : 'Reset password'}
                  </Button>
                </form>

                <p className="mt-6 text-center text-xs leading-5 text-[#6B7280]">
                  After resetting your password, use it with your company email on the shared Login page.
                </p>
              </section>
            )}
          </Card>

          <p className="mt-5 text-center text-sm text-[#6B7280]">
            Remembered your password?{' '}
            <Link className="font-semibold text-[#045A58] hover:text-[#034A48]" to="/login">
              Return to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const PasswordVisibilityButton = ({
  label,
  onClick,
  visible,
}: {
  label: string
  onClick: () => void
  visible: boolean
}) => (
  <button
    aria-label={label}
    className="flex h-8 w-8 items-center justify-center rounded-lg outline-none transition hover:bg-[#F3F4F6] hover:text-[#111827] focus:ring-4 focus:ring-[#E6F4F3]"
    onClick={onClick}
    title={label}
    type="button"
  >
    {visible ? <EyeOff size={17} /> : <Eye size={17} />}
  </button>
)

const StatusPanel = ({
  description,
  icon,
  title,
}: {
  description: string
  icon: ReactNode
  title: string
}) => (
  <section className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center sm:p-10">
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#E6F4F3] text-[#045A58]">{icon}</div>
    <h1 className="mt-5 text-xl font-semibold text-[#111827]">{title}</h1>
    <p className="mt-2 max-w-sm text-sm leading-6 text-[#6B7280]">{description}</p>
  </section>
)

const ErrorPanel = ({ state }: { state: ResetErrorState }) => {
  const error = resetErrors[state]

  return (
    <section className="flex min-h-[380px] flex-col items-center justify-center p-8 text-center sm:p-10">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FEE2E2] text-[#B42318]">
        <AlertCircle size={25} />
      </div>
      <h1 className="mt-5 text-xl font-semibold text-[#111827]">{error.title}</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#6B7280]">{error.description}</p>
      <Link
        className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-transparent bg-[#045A58] px-4 text-sm font-semibold text-white outline-none transition hover:bg-[#034A48] focus:ring-4 focus:ring-[#E6F4F3]"
        to="/forgot-password"
      >
        Request a new reset link
      </Link>
      <Link className="mt-4 text-sm font-semibold text-[#045A58] hover:text-[#034A48]" to="/login">
        Return to sign in
      </Link>
    </section>
  )
}

const SuccessPanel = ({ onContinue }: { onContinue: () => void }) => (
  <section className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center sm:p-10">
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
      <CheckCircle2 size={26} />
    </div>
    <h1 className="mt-5 text-xl font-semibold text-[#111827]">Password reset complete</h1>
    <p className="mt-2 max-w-sm text-sm leading-6 text-[#6B7280]">
      Your password has been updated. Use the new password the next time you sign in.
    </p>
    <Button className="mt-6 w-full max-w-xs" onClick={onContinue} rightIcon={<ArrowRight size={18} />} size="lg">
      Continue to sign in
    </Button>
  </section>
)

export default ResetPasswordPage
