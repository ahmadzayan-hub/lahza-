import { useEffect } from "react";

/**
 * Injects a JSON-LD <script> into <head> and removes it on unmount, so each
 * page can declare its own structured data for SEO (rich results).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  useEffect(() => {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.text = JSON.stringify(data);
    document.head.appendChild(el);
    return () => {
      document.head.removeChild(el);
    };
  }, [data]);
  return null;
}

export function productJsonLd(p: {
  name: string;
  description: string;
  image: string;
  price: number;
  sku: string;
  ratingValue?: number;
  reviewCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.image,
    sku: p.sku,
    brand: { "@type": "Brand", name: "Beyond Style UAE" },
    offers: {
      "@type": "Offer",
      priceCurrency: "AED",
      price: p.price,
      availability: "https://schema.org/InStock",
    },
    ...(p.ratingValue && p.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: p.ratingValue,
            reviewCount: p.reviewCount,
          },
        }
      : {}),
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Beyond Style UAE",
  legalName: "Beyond Connect General Trading L.L.C",
  url: "https://beyondstyle.ae",
  logo: "https://beyondstyle.ae/icon.svg",
  areaServed: "AE",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
};
