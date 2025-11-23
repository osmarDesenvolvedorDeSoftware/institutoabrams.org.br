import { WeNeedSupport } from "@/components/organisms/we-need-support";
import WhoWeAreSection from "@/components/organisms/who-we-are-section";
import { LandingPageResponse } from "./api/route";

export default async function HomePage() {
  const data = await fetch("http://localhost:3000/api");
  const { landingPage } = (await data.json()) as LandingPageResponse;

  return (
    <main>
      <WhoWeAreSection
        whoWeAreText={landingPage.whoWeAreSection.whoWeAreText}
      />
      <WeNeedSupport />
    </main>
  );
}
