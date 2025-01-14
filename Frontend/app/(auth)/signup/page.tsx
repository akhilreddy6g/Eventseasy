import { Metadata } from "next"
import Link from "next/link"
import { AuthForm } from "@/components/auth/auth-form"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


export const metadata: Metadata = {
  title: "Sign Up - EventBuzz",
  description: "Create your EventBuzz account",
}

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account
          </p>
          <p className="font-medium text-sm text-left pt-2 pb-0">
            Sign Up as
          </p>
          <RadioGroup defaultValue="guest">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="host" id="host" />
              <Label htmlFor="host" className="text-muted-foreground">Host</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="event-manager" id="event-manager" />
              <Label htmlFor="event-manager" className="text-muted-foreground">Event Manager</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="guest" id="guest" />
              <Label htmlFor="guest" className="text-muted-foreground">Guest</Label>
            </div>
          </RadioGroup>
        </div>
        <AuthForm type="signup" />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-brand underline underline-offset-4">
            Already have an account? Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}