import { getDictionary, type Locale } from "@/i18n";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">{dict.app.title}</h1>
      <p className="mt-4 text-lg text-gray-600">{dict.app.description}</p>
    </main>
  );
}
