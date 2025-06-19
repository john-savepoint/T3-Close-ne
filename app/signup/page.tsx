import { redirect } from 'next/navigation'

export default function SignUpPage() {
  // Redirect to the new Clerk sign-up page
  redirect('/sign-up')
}
