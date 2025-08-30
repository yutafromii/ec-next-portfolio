// import Image from "next/image";

import ScrollToTopButton from "@/components/ui/common/ScrollToTopButton";
import AccessSection from "@/components/ui/home/AccessSection";
import BrandConceptSection from "@/components/ui/home/BrandConceptSection";
import ContactCallToAction from "@/components/ui/home/ContactCallToAction";
import Hero from "@/components/ui/home/Hero";
import NewsSection from "@/components/ui/home/NewsSection ";
import ProductPreview from "@/components/ui/home/ProductPreview";

export default function Home() {
  return (
    <div className="">
      <Hero />
      <NewsSection />
      <ProductPreview />
      <BrandConceptSection />
      <AccessSection />
      <ContactCallToAction />
      <ScrollToTopButton />
    </div>
  );
}
