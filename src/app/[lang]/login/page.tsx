import { LoginForm } from "@/components/auth/LoginForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { getDictionary, type Locale } from "@/i18n";

interface LoginPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ password_updated?: string; verified?: string }>;
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const { password_updated, verified } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-8 text-center text-2xl font-bold">
        {dictionary.auth.login.title}
      </h1>

      <div className="space-y-6">
        {password_updated && (
          <div className="rounded-md bg-success p-4">
            <p className="text-sm text-success-foreground">{dictionary.auth.passwordReset.passwordUpdated}</p>
          </div>
        )}
        {verified && (
          <div className="rounded-md bg-success p-4">
            <p className="text-sm text-success-foreground">{dictionary.auth.emailVerification.emailConfirmed}</p>
          </div>
        )}
        <LoginForm lang={lang} dict={dictionary} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-primary px-2 text-muted-foreground">{dictionary.auth.login.divider}</span>
          </div>
        </div>

        <OAuthButtons dict={dictionary} />
      </div>
    </main>
  );
}