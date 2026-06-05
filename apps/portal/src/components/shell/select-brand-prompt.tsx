import { Link } from "react-router-dom";

import { Card, CardTitle } from "@/components/ui/card";
import { useSelectedBrand } from "@/providers/selected-brand-provider";

export function SelectBrandPrompt({
  title = "Select a brand workspace",
}: {
  title?: string;
}) {
  const { brandProfileId } = useSelectedBrand();
  if (brandProfileId) return null;

  return (
    <Card className="mb-6">
      <CardTitle>{title}</CardTitle>
      <p className="mt-2 text-sm text-muted">
        Choose which client brand you are working on. Dashboard metrics and lists
        are scoped to that workspace.
      </p>
      <Link
        to="/brands"
        className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
      >
        Go to brand workspaces
      </Link>
    </Card>
  );
}
