import { useLanguage } from "../contexts/LanguageContext";

const PageSkeleton = ({ variant = "page" }) => {
  const { t } = useLanguage();

  return (
    <div className={`skel-page skel-${variant}`} role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{t("loading")}</span>
      {variant === "app" && (
        <div className="skel-app">
          <aside>
            <i className="w-50" />
            <i className="w-70" />
            <i className="w-60" />
            <i className="w-55" />
            <i className="w-65" />
          </aside>
          <div>
            <i className="w-40 h-24" />
            <div className="skel-row">
              <i className="h-72" />
              <i className="h-72" />
              <i className="h-72" />
              <i className="h-72" />
            </div>
            <i className="h-220" />
          </div>
        </div>
      )}
      {variant === "dashboard" && (
        <>
          <i className="w-40 h-24" />
          <i className="w-70 h-14" />
          <div className="skel-row">
            <i className="h-72" />
            <i className="h-72" />
            <i className="h-72" />
            <i className="h-72" />
          </div>
          <i className="h-220" />
          <div className="skel-row three">
            <i className="h-120" />
            <i className="h-120" />
            <i className="h-120" />
          </div>
        </>
      )}
      {variant === "cards" && (
        <>
          <i className="w-40 h-24" />
          <div className="skel-row">
            <i className="h-140" />
            <i className="h-140" />
          </div>
          <div className="skel-row three">
            <i className="h-140" />
            <i className="h-140" />
            <i className="h-140" />
          </div>
        </>
      )}
      {variant === "table" && (
        <>
          <i className="w-40 h-24" />
          <i className="h-220" />
        </>
      )}
      {variant === "charts" && (
        <div className="skel-row">
          <i className="h-220" />
          <i className="h-220" />
        </div>
      )}
      {variant === "auth" && (
        <div className="skel-auth">
          <i className="w-50 h-24" />
          <i className="h-14" />
          <i className="h-44" />
          <i className="h-44" />
          <i className="h-44" />
        </div>
      )}
      {variant === "page" && (
        <>
          <i className="w-50 h-24" />
          <i className="w-80 h-14" />
          <i className="h-14" />
          <i className="h-14" />
          <i className="w-60 h-14" />
        </>
      )}
    </div>
  );
};

export default PageSkeleton;
