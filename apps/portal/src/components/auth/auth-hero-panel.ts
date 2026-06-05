/** Single hero panel spec for all brand auth screens */
export const AUTH_HERO_PANEL_CLASS = [
  "brand-login-gradient relative hidden h-full min-h-0 shrink-0 flex-col overflow-hidden",
  "w-full max-w-[460px] lg:flex xl:max-w-[500px] 2xl:max-w-[520px]",
].join(" ");

/** Outer padding inside the purple panel */
export const AUTH_HERO_INNER_CLASS =
  "relative z-10 flex h-full min-h-0 flex-col px-10 py-8 xl:px-12 xl:py-10 2xl:px-14";

/**
 * Narrow text column — shared by login & signup so placement matches.
 * Leaves visible gutter on both sides of the panel.
 */
export const AUTH_HERO_CONTENT_CLASS = "mx-auto flex w-full max-w-[280px] flex-col xl:max-w-[300px]";

/** Main copy block spacing (below logo) */
export const AUTH_HERO_BODY_BLOCK_CLASS =
  "flex min-h-0 flex-1 flex-col pt-6 lg:pt-8";

/** Gap between headline and secondary block (features / stats card) */
export const AUTH_HERO_SECTION_GAP_CLASS = "mt-8 xl:mt-9";

export const authHeroTitleClass =
  "font-display text-[1.5625rem] font-bold leading-[1.3] tracking-tight text-white xl:text-[1.6875rem] xl:leading-[1.28]";

export const authHeroBodyClass =
  "mt-3 text-[13px] leading-[1.55] text-violet-100/90 xl:mt-3.5 xl:text-sm";

export const authHeroFeatureTitleClass =
  "text-sm font-semibold leading-snug text-white";

export const authHeroFeatureBodyClass =
  "mt-1.5 text-[12px] leading-[1.55] text-violet-100/90 xl:text-[13px]";

export const authHeroFooterClass =
  "text-[10px] leading-snug text-violet-200/70 xl:text-[11px]";
