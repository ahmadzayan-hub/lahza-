import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";
import { Seo } from "@/components/Seo";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <>
      <Seo title="404" />
      <div className="container-max flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <span className="font-serif text-7xl font-bold text-cream-200">404</span>
        <p className="mt-4 text-lg text-coffee-600">{t("common.notFound")}</p>
        <Link to="/" className="btn btn-primary mt-6">{t("common.backHome")}</Link>
      </div>
    </>
  );
}
