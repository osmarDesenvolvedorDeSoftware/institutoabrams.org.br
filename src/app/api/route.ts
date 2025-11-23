const dummyData = {
  landingPage: {
    whoWeAreSection: {
      whoWeAreText:
        "SkillBridge Foundation is a registered not-for-profit organization dedicated to advancing the well-being of children and promoting equality for girls and young women across communities. Through its grassroots social development efforts, SkillBridge Foundation strives to create lasting positive change in the lives of vulnerable children, their families, and their communities by adopting a gender-transformative, child-centered approach. Since its inception in 1996, SkillBridge  Foundation has positively impacted the lives of millions of young people by connecting them with protective services, quality education, accessible healthcare, a healthy environment, better livelihood opportunities, and meaningful community participation.",
    },
    whyWeNeedSupportSection: {
      whyWeNeedSupportText:
        "Every child deserves a safe, healthy, and fair start in life. Yet millions around the world still face challenges that deny them access to education, protection, and basic needs.",
    },
  },
};

export type LandingPageResponse = typeof dummyData;

export async function GET() {
  return Response.json(dummyData);
}
