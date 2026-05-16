import { SignupForm } from "@/components/auth/SignupForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { getDictionary, type Locale } from "@/i18n";

interface SignupPageProps {
  params: Promise<{ lang: string }>;
}

export default async function SignupPage({ params }: SignupPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-8 text-center text-2xl font-bold">
        {dictionary.auth.signup.title}
      </h1>

      <div className="space-y-6">
        <SignupForm lang={lang} dict={dictionary} />

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