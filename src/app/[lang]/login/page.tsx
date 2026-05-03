import { LoginForm } from "@/components/auth/LoginForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import type { Dictionary } from "@/i18n/types";

interface LoginPageProps {
  params: Promise<{ lang: string }>;
  dictionary: Dictionary;
}

export default async function LoginPage({ params, dictionary }: LoginPageProps) {
  const { lang } = await params;

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-8 text-center text-2xl font-bold">
        {dictionary.auth.login.title}
      </h1>

      <div className="space-y-6">
        <LoginForm lang={lang} dict={dictionary} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">o</span>
          </div>
        </div>

        <OAuthButtons dict={dictionary} />
      </div>
    </main>
  );
}