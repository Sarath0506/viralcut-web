import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { agencyApi, ApiError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useSelectedBrand } from "@/providers/selected-brand-provider";

export function BrandNewPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { setBrand } = useSelectedBrand();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) throw new Error("Session expired");
      return agencyApi.brands.create(token, {
        companyName: companyName.trim(),
        contactEmail: contactEmail.trim() || undefined,
      });
    },
    onSuccess: (result) => {
      setBrand(result.id, result.companyName);
      toast(
        result.inviteSent
          ? "Workspace created and invite sent."
          : "Workspace created.",
        "success",
      );
      navigate("/brands");
    },
    onError: (err) => {
      toast(
        err instanceof ApiError ? err.message : "Could not create workspace",
        "error",
      );
    },
  });

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">
          New brand workspace
        </h2>
        <p className="mt-1 text-sm text-muted">
          The agency can run campaigns immediately; invite the brand owner when
          ready.
        </p>
      </div>
      <Card className="max-w-lg">
        <CardTitle>Brand details</CardTitle>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <div>
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              minLength={2}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="contactEmail">Owner email (optional)</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="owner@brand.in"
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending}>
              Create workspace
            </Button>
            <Link
              to="/brands"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </>
  );
}
