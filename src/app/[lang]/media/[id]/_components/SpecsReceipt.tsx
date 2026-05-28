import { Receipt } from "@/components/vhs";

interface SpecsReceiptProps {
  heading: string;
  catalog: { label: string; value: string };
  year?: { label: string; value: string | number } | null;
  source: { label: string; value: string };
  score?: { label: string; value: string } | null;
  episodes?: { label: string; value: string | number } | null;
  format: { label: string; value: string };
}

export function SpecsReceipt({
  heading,
  catalog,
  year,
  source,
  score,
  episodes,
  format,
}: SpecsReceiptProps) {
  const rows = [
    { label: catalog.label, value: catalog.value },
    ...(year ? [{ label: year.label, value: String(year.value) }] : []),
    { label: source.label, value: source.value },
    ...(score ? [{ label: score.label, value: score.value }] : []),
    ...(episodes
      ? [{ label: episodes.label, value: String(episodes.value) }]
      : []),
    { label: format.label, value: format.value },
  ];
  return <Receipt heading={heading} rows={rows} />;
}
