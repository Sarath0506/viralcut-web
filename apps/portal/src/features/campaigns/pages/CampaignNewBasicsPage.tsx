import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ImagePlus,
  Instagram,
  Loader2,
  Twitter,
  Youtube,
} from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import {
  CampaignWizardFooter,
  CampaignWizardHeader,
} from "@/features/campaigns/components/campaign-wizard-layout";
import { WizardStepper } from "@/features/campaigns/components/wizard-stepper";
import { useCampaignDraftSave } from "@/features/campaigns/hooks/use-campaign-draft-save";
import { useWizardBack } from "@/features/campaigns/hooks/use-wizard-back";
import { normalizeUploadUrl, resolveMediaUrl } from "@/lib/media-url";
import { ApiError, brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useCampaignWizard } from "@/providers/campaign-wizard";

const INSTAGRAM_REEL = "instagram_reel";
const INSTAGRAM_POST = "instagram_post";
const YOUTUBE_SHORTS = "youtube_shorts";
const TWITTER_TWEET = "twitter_tweet";

const platformCardSelected =
  "border-primary bg-primary/10 ring-1 ring-primary/20";
const platformChipSelected =
  "border-primary bg-primary/15 text-primary";
const platformChipDefault =
  "border-border bg-background text-foreground hover:bg-surface-variant";

const MAX_COVER_BYTES = 3 * 1024 * 1024;

export function CampaignNewBasicsPage() {
  const navigate = useNavigate();
  const { draft, paths, update, saveNow } = useCampaignWizard();
  const { goBack, backLabel } = useWizardBack();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const { saveDraftWithFeedback, saving } = useCampaignDraftSave();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const selectedPlatforms = new Set(draft.platforms);

  const onCoverSelected = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Cover must be an image (PNG, JPG, or WEBP).", "error");
      return;
    }
    if (file.size > MAX_COVER_BYTES) {
      toast("Cover image must be 3MB or smaller.", "error");
      return;
    }
    const token = getToken();
    if (!token) {
      toast("Your session expired. Please log in again.", "error");
      return;
    }
    setUploadingCover(true);
    try {
      const uploaded = await brandApi.campaigns.uploadCoverImage(token, file);
      update({ coverImageUrl: normalizeUploadUrl(uploaded) });
      toast("Cover image uploaded.", "success");
    } catch (error) {
      toast(
        error instanceof ApiError ? error.message : "Failed to upload cover image.",
        "error",
      );
    } finally {
      setUploadingCover(false);
    }
  };

  const togglePlatform = (value: string) => {
    if (selectedPlatforms.has(value)) {
      update({ platforms: draft.platforms.filter((item) => item !== value) });
      return;
    }
    update({ platforms: [...draft.platforms, value] });
  };

  const hasPlatform = draft.platforms.length > 0;
  const hasInstagramReel = selectedPlatforms.has(INSTAGRAM_REEL);
  const hasInstagramPost = selectedPlatforms.has(INSTAGRAM_POST);
  const instagramBothSelected = hasInstagramReel && hasInstagramPost;
  const youtubeSelected = selectedPlatforms.has(YOUTUBE_SHORTS);
  const twitterSelected = selectedPlatforms.has(TWITTER_TWEET);

  return (
    <>
      <WizardStepper />
      <div className="space-y-6 pb-20">
        <CampaignWizardHeader
          title={draft.campaignId ? "Edit Campaign" : "Create New Campaign"}
          subtitle="Set up your performance-driven creator campaign."
        />
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-stretch">
          <Card className="h-full">
            <CardTitle className="text-base font-bold text-foreground">
              Campaign Identity
            </CardTitle>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold normal-case tracking-normal text-foreground" htmlFor="title">
                  Campaign Name
                </Label>
                <Input
                  id="title"
                  value={draft.title}
                  onChange={(e) => update({ title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold normal-case tracking-normal text-foreground" htmlFor="category">
                  Category
                </Label>
                <Input
                  id="category"
                  value={draft.category}
                  onChange={(e) => update({ category: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
                <div className="flex h-full flex-col space-y-3">
                  <Label className="text-sm font-bold normal-case tracking-normal text-foreground">
                    Target Platforms
                  </Label>
                  <div className="space-y-3">
                    <div
                      className={cn(
                        "rounded-xl border border-border bg-surface p-3 transition-colors",
                        instagramBothSelected && platformCardSelected,
                      )}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-variant text-muted">
                          <Instagram className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          Instagram
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => togglePlatform(INSTAGRAM_REEL)}
                          className={cn(
                            "rounded-lg border px-3 py-2.5 text-center text-sm font-semibold transition",
                            hasInstagramReel
                              ? platformChipSelected
                              : platformChipDefault,
                          )}
                        >
                          Reel
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePlatform(INSTAGRAM_POST)}
                          className={cn(
                            "rounded-lg border px-3 py-2.5 text-center text-sm font-semibold transition",
                            hasInstagramPost
                              ? platformChipSelected
                              : platformChipDefault,
                          )}
                        >
                          Post
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => togglePlatform(YOUTUBE_SHORTS)}
                        className={cn(
                          "flex flex-col items-center rounded-xl border border-border bg-surface px-3 py-3 transition-colors",
                          youtubeSelected && platformCardSelected,
                        )}
                      >
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-variant text-muted">
                          <Youtube className="h-4 w-4" />
                        </span>
                        <span
                          className={cn(
                            "mt-2 text-sm font-semibold",
                            youtubeSelected ? "text-primary" : "text-foreground",
                          )}
                        >
                          YouTube
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 text-xs font-medium",
                            youtubeSelected ? "text-primary/80" : "text-muted",
                          )}
                        >
                          Shorts
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => togglePlatform(TWITTER_TWEET)}
                        className={cn(
                          "flex flex-col items-center rounded-xl border border-border bg-surface px-3 py-3 transition-colors",
                          twitterSelected && platformCardSelected,
                        )}
                      >
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-variant text-muted">
                          <Twitter className="h-4 w-4" />
                        </span>
                        <span
                          className={cn(
                            "mt-2 text-sm font-semibold",
                            twitterSelected ? "text-primary" : "text-foreground",
                          )}
                        >
                          Twitter
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 text-xs font-medium",
                            twitterSelected ? "text-primary/80" : "text-muted",
                          )}
                        >
                          Tweet
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex h-full flex-col space-y-3">
                  <Label className="text-sm font-bold normal-case tracking-normal text-foreground">
                    Campaign Timeline
                  </Label>
                  <div className="flex flex-1 flex-col justify-center rounded-xl border border-border bg-surface p-4">
                    <div className="space-y-2">
                      <Label
                        className="text-sm font-bold normal-case tracking-normal text-foreground"
                        htmlFor="startDate"
                      >
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={draft.startDate}
                        onChange={(e) => update({ startDate: e.target.value })}
                        className="text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <Card className="flex h-full min-h-0 flex-col border-dashed">
              <CardTitle className="text-base font-bold text-foreground">
                Campaign Cover Image
              </CardTitle>
              <button
                type="button"
                disabled={uploadingCover}
                onClick={() => coverInputRef.current?.click()}
                className={cn(
                  "relative mt-4 flex min-h-[280px] flex-1 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-surface-variant/50 text-muted lg:min-h-0",
                  uploadingCover && "opacity-70",
                )}
              >
                {draft.coverImageUrl ? (
                  <img
                    src={resolveMediaUrl(draft.coverImageUrl)}
                    alt="Campaign cover preview"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <ImagePlus className="h-7 w-7" />
                    <span className="mt-2 text-sm font-semibold">No file selected</span>
                  </>
                )}
                <span className="relative z-10 mt-2 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold">
                  {uploadingCover ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Uploading...
                    </span>
                  ) : draft.coverImageUrl ? (
                    "Replace cover image"
                  ) : (
                    "PNG, JPG, WEBP up to 3MB"
                  )}
                </span>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => void onCoverSelected(e.target.files?.[0])}
                />
              </button>
          </Card>
        </div>
        <CampaignWizardFooter
          leftAction={{
            id: "back",
            label: backLabel,
            onClick: goBack,
            buttonProps: { size: "sm", variant: "outline" },
          }}
          rightActions={[
            {
              id: "save-draft",
              label: saving ? "Saving..." : "Save as Draft",
              onClick: () => void saveDraftWithFeedback(toast),
              buttonProps: { size: "sm", variant: "outline", disabled: saving },
            },
            {
              id: "next",
              label: "Next",
              onClick: () => {
                void saveNow("brief").then(() => navigate(paths.brief));
              },
              icon: <ArrowRight className="h-4 w-4" />,
              buttonProps: {
                size: "sm",
                disabled: !draft.title.trim() || !hasPlatform,
              },
            },
          ]}
        />
      </div>
    </>
  );
}
